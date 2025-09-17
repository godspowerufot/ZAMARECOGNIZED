// utils/zamaSDK.ts
declare global {
  interface Window {
    fhevm?: any;
    ZamaFHE?: any;
    FhevmSDK?: any;
    relayerSDK?: any;
    ZamaRelayerSDK?: any;
    FHEVM?: any;
  }
}

export class ZamaSDKLoader {
  private static instance: any = null;
  private static loading: Promise<any> | null = null;
  private static isInitialized = false;

  // First try to use npm package if available
  static async loadNpmSDK(): Promise<any> {
    try {
      console.log("🔍 Attempting to load Zama SDK from npm...");
      // Try to import the npm package
      const { initSDK, createInstance, SepoliaConfig } = await import(
        "@zama-fhe/relayer-sdk/bundle"
      );
      console.log("✅ NPM SDK loaded successfully");
      await initSDK();
      const instance = await createInstance(SepoliaConfig);
      console.log("✅ NPM SDK instance created");
      return instance;
    } catch (error) {
      console.warn("⚠️ NPM SDK not found, trying CDN approach:", error);
      return null;
    }
  }

  // Fallback to CDN loading with updated URL
  static async loadCDNSDK(): Promise<any> {
    const cdnUrls = [
      "https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs",
    ];

    console.log("🌐 Attempting to load Zama SDK from CDN...");

    for (const url of cdnUrls) {
      try {
        console.log(`📡 Trying CDN URL: ${url}`);
        const sdk = await this.loadScriptFromCDN(url);
        if (sdk) {
          console.log(`✅ Successfully loaded from ${url}`);
          return sdk;
        }
      } catch (error) {
        console.warn(`❌ Failed to load from ${url}:`, error);
      }
    }

    throw new Error("All CDN attempts failed");
  }

  private static loadScriptFromCDN(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check if already loaded in various possible global names
      const existingSDK =
        window.fhevm ||
        window.ZamaFHE ||
        window.FhevmSDK ||
        window.relayerSDK ||
        window.ZamaRelayerSDK ||
        window.FHEVM;

      if (existingSDK) {
        console.log("♻️ Found existing SDK instance in global scope");
        resolve(existingSDK);
        return;
      }

      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${url}"]`);
      if (existingScript) {
        console.log("🔄 Script already exists, checking for SDK...");
        // Wait a bit for the script to initialize
        setTimeout(() => {
          const sdk =
            window.fhevm ||
            window.ZamaFHE ||
            window.FhevmSDK ||
            window.relayerSDK;
          if (sdk) {
            resolve(sdk);
          } else {
            reject(new Error("Script loaded but SDK not found"));
          }
        }, 1000);
        return;
      }

      console.log(`📥 Loading script from: ${url}`);
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      script.crossOrigin = "anonymous";

      script.onload = () => {
        console.log("📜 Script loaded, searching for SDK...");

        // Wait a moment for the SDK to initialize
        setTimeout(() => {
          try {
            // Try different possible global variable names
            const sdk =
              window.fhevm ||
              window.ZamaFHE ||
              window.FhevmSDK ||
              window.relayerSDK ||
              window.ZamaRelayerSDK ||
              window.FHEVM;

            if (sdk) {
              console.log("✅ SDK found in global scope");
              // Cache it under a consistent name
              window.fhevm = sdk;
              resolve(sdk);
            } else {
              // Log all available globals for debugging
              const globals = Object.keys(window).filter(
                (key) =>
                  key.toLowerCase().includes("zama") ||
                  key.toLowerCase().includes("fhe") ||
                  key.toLowerCase().includes("relayer") ||
                  key.toLowerCase().includes("sdk")
              );
              console.error(
                "❌ SDK not found. Available FHE-related globals:",
                globals
              );
              console.log(
                "🔍 All window properties:",
                Object.keys(window).slice(0, 20)
              );
              reject(
                new Error(
                  `SDK not found after script load. Available globals: ${globals.join(
                    ", "
                  )}`
                )
              );
            }
          } catch (err) {
            console.error("❌ Error while checking for SDK:", err);
            reject(err);
          }
        }, 500);
      };

      script.onerror = (error) => {
        console.error(`❌ Failed to load script from ${url}:`, error);
        reject(new Error(`Failed to load script from ${url}`));
      };

      document.head.appendChild(script);
      console.log("📌 Script element added to document head");
    });
  }

  static async loadSDK(): Promise<any> {
    // Return cached instance if available
    if (this.instance) {
      console.log("♻️ Returning cached SDK instance");
      return this.instance;
    }

    // Return existing loading promise if in progress
    if (this.loading) {
      console.log("⏳ SDK loading already in progress, waiting...");
      return this.loading;
    }

    console.log("🚀 Starting SDK loading process...");

    // Start loading
    this.loading = (async () => {
      try {
        // First try NPM package
        const npmSDK = await this.loadNpmSDK();
        if (npmSDK) {
          console.log("✅ Using NPM SDK");
          this.instance = npmSDK;
          return npmSDK;
        }

        // Fallback to CDN
        console.log("🔄 Falling back to CDN SDK...");
        const cdnSDK = await this.loadCDNSDK();
        this.instance = cdnSDK;
        console.log("✅ Using CDN SDK");
        return cdnSDK;
      } catch (error) {
        console.error("❌ SDK loading failed:", error);
        this.loading = null; // Reset loading state on failure
        throw error;
      }
    })();

    return this.loading;
  }

  static async initializeSDK() {
    try {
      console.log("🔧 Initializing Zama SDK...");

      const sdk = await this.loadSDK();

      if (!sdk) {
        throw new Error("Failed to load SDK");
      }

      // If we already have an initialized instance, return it
      if (this.isInitialized) {
        console.log("✅ Using already initialized SDK instance");
        return sdk;
      }

      // If we have the raw SDK module, initialize it
      if (sdk && typeof sdk.initSDK === "function") {
        console.log("🔧 Initializing SDK module...");
        await sdk.initSDK();

        if (typeof sdk.createInstance === "function") {
          console.log("🏗️ Creating SDK instance...");
          const instance = await sdk.createInstance();
          this.instance = instance;
          this.isInitialized = true;
          console.log("✅ SDK instance created successfully");
          return instance;
        }
      }

      // Just use the SDK instance as is
      console.log("✅ Using SDK instance as is");
      this.instance = sdk;
      this.isInitialized = true;
      return sdk;
    } catch (error) {
      console.error("❌ Failed to initialize Zama SDK:", error);
      this.instance = null;
      this.loading = null;
      this.isInitialized = false;
      throw error;
    }
  }

  // Reset the loader state (useful for testing or error recovery)
  static reset() {
    console.log("🔄 Resetting SDK loader state");
    this.instance = null;
    this.loading = null;
    this.isInitialized = false;
  }

  // Get current state for debugging
  static getState() {
    return {
      hasInstance: !!this.instance,
      isLoading: !!this.loading,
      isInitialized: this.isInitialized,
    };
  }
}

// Simple function exports
export const loadZamaSDK = async () => {
  return ZamaSDKLoader.loadSDK();
};

export const initializeZamaFHE = async () => {
  return ZamaSDKLoader.initializeSDK();
};

// Export reset function for debugging
export const resetZamaSDK = () => {
  ZamaSDKLoader.reset();
};

// Export state getter for debugging
export const getZamaSDKState = () => {
  return ZamaSDKLoader.getState();
};
