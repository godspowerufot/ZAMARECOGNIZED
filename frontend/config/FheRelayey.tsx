"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  initializeFHE,
  getFhevmInstance,
  encryptNumber,
  isFhevmInitialized,
} from "../lib/index"; // Adjust path to where you put the FHE utility

// Define the FHE context type
interface FheContextType {
  instance: any;
  isReady: boolean;
  encryptNumber: (
    value: number,
    contractAddress: string,
    userAddress: string
  ) => Promise<{ encryptedData: string; inputProof: string }>;
  createEncryptedInput: (
    contractAddress: string,
    account: string,
    plainValues: number[]
  ) => Promise<any>;
  initializeFHE: () => Promise<any>;
  isFhevmInitialized: () => boolean;
}

const FheContext = createContext<FheContextType | null>(null);

export function FheProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<any>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Initialize FHE using the CDN utility
  useEffect(() => {
    const initFhe = async () => {
      try {
        console.log("Initializing FHE using CDN utility...");
        const fheInstance = await getFhevmInstance();
        setInstance(fheInstance);
        setIsReady(true);
        console.log("FHE initialized successfully");
      } catch (error) {
        console.error("Failed to initialize FHE:", error);
        setIsReady(false);
      }
    };

    initFhe();
  }, []);

  // Wrapper for the encryptNumber utility function
  const encryptNumberWrapper = useCallback(
    async (value: number, contractAddress: string, userAddress: string) => {
      if (!isReady) {
        throw new Error("FHE is not ready yet");
      }
      return await encryptNumber(value, contractAddress, userAddress);
    },
    [isReady]
  );

  // Custom createEncryptedInput function using the CDN utility
  const createEncryptedInput = useCallback(
    async (contractAddress: string, account: string, plainValues: number[]) => {
      try {
        if (!instance || !isReady) {
          throw new Error("FHE SDK is not ready");
        }

        // For multiple values, we'll use the instance directly
        const input = instance.createEncryptedInput(contractAddress, account);

        // Add values to the input
        plainValues.forEach((value) => {
          input.add32(BigInt(value));
        });

        // Encrypt the input
        const { handles, inputProof } = await input.encrypt();

        // Convert Uint8Array to hex strings if needed
        const toHex = (uint8Array: Uint8Array): string => {
          return (
            "0x" +
            Array.from(uint8Array)
              .map((byte) => byte.toString(16).padStart(2, "0"))
              .join("")
          );
        };

        return {
          handles: handles.map((handle: any) =>
            handle instanceof Uint8Array ? toHex(handle) : handle
          ),
          inputProof:
            inputProof instanceof Uint8Array ? toHex(inputProof) : inputProof,
          values: plainValues,
          types: plainValues.map(() => "u32"),
        };
      } catch (error: any) {
        console.error("❌ Error creating encrypted input:", error);
        throw error;
      }
    },
    [instance, isReady]
  );

  const contextValue: FheContextType = {
    instance,
    isReady,
    encryptNumber: encryptNumberWrapper,
    createEncryptedInput,
    initializeFHE,
    isFhevmInitialized,
  };

  return (
    <FheContext.Provider value={contextValue}>{children}</FheContext.Provider>
  );
}

export function useFhe() {
  return useContext(FheContext);
}
