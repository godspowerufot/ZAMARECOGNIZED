// config/FheRelayey.tsx
"use client";

import { initializeZamaFHE } from "@/utils/zamaSDK";
import { createContext, useContext, useEffect, useState } from "react";

interface FheContextType {
  instance: any;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

const FheContext = createContext<FheContextType | null>(null);

export function FheProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    const initFHE = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("Initializing FHE SDK...");
        const fheInstance = await initializeZamaFHE();

        if (mounted) {
          console.log("FHE SDK initialized successfully");
          setInstance(fheInstance);
        }
      } catch (err) {
        console.error("Failed to initialize FHE:", err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to initialize FHE SDK"
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initFHE();

    return () => {
      mounted = false;
    };
  }, [retryKey]); // Depend on retryKey to trigger re-initialization

  const contextValue: FheContextType = {
    instance,
    isLoading,
    error,
    isReady: !!instance && !isLoading && !error,
  };

  return (
    <FheContext.Provider value={contextValue}>{children}</FheContext.Provider>
  );
}

export function useFhe(): FheContextType {
  const context = useContext(FheContext);
  if (!context) {
    throw new Error("useFhe must be used within a FheProvider");
  }
  return context;
}
