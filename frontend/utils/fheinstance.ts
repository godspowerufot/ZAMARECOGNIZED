// utils/fheinstance.ts
import { initializeZamaFHE, resetZamaSDK, getZamaSDKState } from "./zamaSDK";

let fheInstance: any = null;
let isInitializing = false;

export const getFheInstance = () => {
  console.log("🔍 Getting FHE instance:", {
    hasInstance: !!fheInstance,
    isInitializing,
    sdkState: getZamaSDKState(),
  });
  return fheInstance;
};

export const initializeFheInstance = async () => {
  // Return existing instance if available
  if (fheInstance) {
    console.log("♻️ Returning existing FHE instance");
    return fheInstance;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.log("⏳ FHE initialization already in progress, waiting...");

    // Wait for the current initialization to complete
    let attempts = 0;
    const maxAttempts = 50; // 10 seconds max wait

    while (isInitializing && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      attempts++;
    }

    if (fheInstance) {
      console.log("✅ FHE initialization completed by another call");
      return fheInstance;
    }

    if (attempts >= maxAttempts) {
      console.warn("⚠️ FHE initialization timeout, retrying...");
      isInitializing = false; // Reset the flag
    }
  }

  isInitializing = true;
  console.log("🚀 Starting FHE instance initialization...");

  try {
    const instance = await initializeZamaFHE();

    if (!instance) {
      throw new Error("Failed to get FHE instance from SDK");
    }

    // Validate the instance has required methods
    const requiredMethods = ["encrypt32", "encrypt64", "encryptBool"];
    const missingMethods = requiredMethods.filter(
      (method) => typeof instance[method] !== "function"
    );

    if (missingMethods.length > 0) {
      console.warn("⚠️ FHE instance missing some methods:", missingMethods);
    }

    fheInstance = instance;
    console.log("✅ FHE instance initialized successfully", {
      hasEncrypt32: typeof instance.encrypt32 === "function",
      hasEncrypt64: typeof instance.encrypt64 === "function",
      hasEncryptBool: typeof instance.encryptBool === "function",
      availableMethods: Object.getOwnPropertyNames(instance).filter(
        (name) => typeof instance[name] === "function"
      ),
    });

    return fheInstance;
  } catch (error) {
    console.error("❌ Failed to initialize FHE instance:", error);
    fheInstance = null;
    throw error;
  } finally {
    isInitializing = false;
  }
};

export const resetFheInstance = () => {
  console.log("🔄 Resetting FHE instance");
  fheInstance = null;
  isInitializing = false;
  resetZamaSDK();
};

export const isFheReady = () => {
  const ready = !!fheInstance && typeof fheInstance.encrypt32 === "function";
  console.log("🔍 Checking if FHE is ready:", ready);
  return ready;
};

export const getFheState = () => {
  return {
    hasInstance: !!fheInstance,
    isInitializing,
    isReady: isFheReady(),
    sdkState: getZamaSDKState(),
  };
};
