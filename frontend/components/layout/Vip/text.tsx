// Fixed VIP Status Card Component
"use client";

import { useEffect, useState } from "react";
import { Shield, Calendar, Star, Loader2, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import {
  useRegisterVIP,
  useCheckVIPStatus,
  useHasVIPNominatedThisWeek,
  useGetEncryptedVIPId,
  useBecomeVIPForTesting,
} from "@/hooks/use-Vip";
import { useFhe } from "@/config/FheRelayey";
import { getFheInstance, initializeFheInstance } from "@/utils/fheinstance";
import { toHex } from "viem";
import { useEthersSigner } from "@/app/layout";
import { ethers, hexlify } from "ethers";
import { FHEZamaVipABI } from "@/abi/Vip";

const CONTRACT_ADDRESS = "0x43c1B729048Fb8817F46d5908B015076306ED0df";

interface VIPStatusCardProps {
  isVIP: boolean;
  setIsVIP: (value: boolean) => void;
}

export default function VIPStatusCard({ isVIP, setIsVIP }: VIPStatusCardProps) {
  const { address, isConnected } = useAccount();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const signer = useEthersSigner();
  const { registerVIP, isPending, isConfirming, isSuccess, error } =
    useRegisterVIP();
  const {
    becomeVIPForTesting,
    isPending: isTestPending,
    isConfirming: isTestConfirming,
    isSuccess: isTestSuccess,
    error: testError,
  } = useBecomeVIPForTesting();
  const { data: vipStatus } = useCheckVIPStatus(address as `0x${string}`);
  const { data: encryptedId } = useGetEncryptedVIPId(address as `0x${string}`);
  const { data: nominatedThisWeek } = useHasVIPNominatedThisWeek(
    address as `0x${string}`,
    1
  );

  // Sync VIP status with local state
  useEffect(() => {
    if (vipStatus !== undefined) {
      console.log(
        `🔄 VIP status updated for ${address}: ${Boolean(vipStatus)}`
      );
      setIsVIP(Boolean(vipStatus));
    }
  }, [vipStatus, setIsVIP, address]);

  // Handle registration success
  useEffect(() => {
    if (isSuccess) {
      console.log(`✅ VIP registration successful for address: ${address}`);
    }
  }, [isSuccess, address]);

  // Handle test registration success
  useEffect(() => {
    if (isTestSuccess) {
      console.log(
        `✅ VIP test registration successful for address: ${address}`
      );
    }
  }, [isTestSuccess, address]);

  // Handle registration errors
  useEffect(() => {
    if (error) {
      console.error(`❌ VIP registration error for ${address}:`, {
        message: error.message,
        cause: error.cause,
        stack: error.stack,
      });
    }
  }, [error, address]);

  // Handle test registration errors
  useEffect(() => {
    if (testError) {
      console.error(`❌ VIP test registration error for ${address}:`, {
        message: testError.message,
        cause: testError.cause,
        stack: testError.stack,
      });
    }
  }, [testError, address]);

  const handleBecomeVIP = async () => {
    if (!isConnected || !address) {
      console.warn(
        "⚠️ [BECOME VIP] Wallet not connected or no address available"
      );
      return;
    }

    console.log(
      `🚀 [BECOME VIP] Starting VIP registration for address: ${address}`
    );
    setIsEncrypting(true);

    try {
      console.log("🔐 [BECOME VIP] Initializing FHE instance...");

      let fhe = getFheInstance();
      if (!fhe) {
        console.log(
          "📦 [BECOME VIP] No FHE instance found, creating new one..."
        );
        fhe = await initializeFheInstance();
      }

      if (!fhe) {
        throw new Error("Failed to initialize FHE instance");
      }

      console.log("✅ [BECOME VIP] FHE instance ready");

      // Fixed: Use proper contract address and ensure signer is available
      if (!signer) {
        throw new Error("Signer not available");
      }

      const VIPContract = new ethers.Contract(
        CONTRACT_ADDRESS, // Use the constant instead of ABI.address
        FHEZamaVipABI.abi,
        signer
      );

      // Generate random VIP ID
      const randomVipId = Math.floor(Math.random() * 1000000);
      console.log(`🎲 [BECOME VIP] Generated random VIP ID: ${randomVipId}`);

      // Encrypt input
      console.log("🔏 [BECOME VIP] Creating encrypted input...");
      const ciphertext = await fhe.createEncryptedInput(
        CONTRACT_ADDRESS,
        address
      );

      console.log("➕ [BECOME VIP] Adding random VIP ID to ciphertext...");
      ciphertext.add32(Number(randomVipId)); // ✅ Use 32-bit to match euint32
      console.log("🔑 [BECOME VIP] Encrypting ciphertext...");
      const { handles, inputProof } = await ciphertext.encrypt();

      console.log("📤 [BECOME VIP] Encrypted data prepared", {
        handles,
        inputProof: inputProof ? "available" : "missing",
      });

      // Call registerVIP
      console.log(
        "📨 [BECOME VIP] Sending encrypted registration to contract..."
      );

      // Fixed: Ensure proper handle extraction and validation
      if (!handles || handles.length === 0) {
        throw new Error("No handles generated from encryption");
      }

      if (!inputProof) {
        throw new Error("Input proof not generated");
      }

      const handleHex = hexlify(handles[0]); // should be 0x...
      const proofHex = hexlify(inputProof); // should be 0x...

      console.log("Handle:", handleHex);
      console.log("Proof:", proofHex);

      const registerTx = await VIPContract.registerVIP(handleHex, proofHex);
      const receipt = await registerTx.wait();

      console.log("Transaction receipt:", receipt);
      console.log(
        "🎉 [BECOME VIP] VIP registration transaction sent successfully"
      );
    } catch (err) {
      console.error("❌ [BECOME VIP] VIP registration failed", {
        error: err,
        address,
        timestamp: new Date().toISOString(),
      });
    } finally {
      console.log("🏁 [BECOME VIP] VIP registration process completed");
      setIsEncrypting(false);
    }
  };

  const handleBecomeVIPForTesting = async () => {
    if (!isConnected || !address) {
      console.warn(
        "⚠️ [BECOME VIP TEST] Wallet not connected or no address available"
      );
      return;
    }

    console.log(
      `🧪 [BECOME VIP TEST] Starting VIP test registration for address: ${address}`
    );

    try {
      console.log(
        "📨 [BECOME VIP TEST] Sending test registration to contract..."
      );
      await becomeVIPForTesting();

      console.log(
        "🎉 [BECOME VIP TEST] VIP test registration transaction sent successfully"
      );
    } catch (err) {
      console.error("❌ [BECOME VIP TEST] VIP test registration failed", {
        error: err,
        address,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const isProcessing = isPending || isConfirming || isEncrypting;
  const isTestProcessing = isTestPending || isTestConfirming;

  // Log current component state for debugging
  console.log("🔍 VIPStatusCard state:", {
    address,
    isConnected,
    isVIP,
    vipStatus,
    isProcessing,
    isTestProcessing,
    encryptedId: encryptedId ? `${String(encryptedId).slice(0, 12)}...` : null,
    nominatedThisWeek,
  });

  return (
    <>
      {!isVIP ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            VIPs can browse creators and give recognition. Your identity stays
            encrypted for privacy protection.
          </p>
          <div className="bg-muted/50 p-3 border border-border text-xs space-y-1 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-3 w-3" />
              <span>Encrypted VIP ID for privacy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-3 w-3" />
              <span>One nomination per week limit</span>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 p-3 border border-destructive/20 text-xs text-destructive rounded-lg">
              Registration failed: {error.message}
            </div>
          )}

          {testError && (
            <div className="bg-destructive/10 p-3 border border-destructive/20 text-xs text-destructive rounded-lg">
              Test registration failed: {testError.message}
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={handleBecomeVIP}
              disabled={!isConnected || isProcessing}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-gaming w-full"
            >
              {!isConnected ? (
                "CONNECT WALLET FIRST"
              ) : isProcessing ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {isEncrypting
                      ? "ENCRYPTING..."
                      : isPending
                      ? "CONFIRMING..."
                      : "PROCESSING..."}
                  </span>
                </div>
              ) : (
                "BECOME VIP"
              )}
            </Button>

            <Button
              onClick={handleBecomeVIPForTesting}
              disabled={!isConnected || isTestProcessing}
              variant="outline"
              className="font-gaming w-full"
            >
              {!isConnected ? (
                "CONNECT WALLET FIRST"
              ) : isTestProcessing ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {isTestPending ? "CONFIRMING..." : "PROCESSING..."}
                  </span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <TestTube className="h-4 w-4" />
                  <span>BECOME VIP (TEST)</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Badge variant="secondary" className="font-gaming">
            <Star className="mr-1 h-3 w-3" />
            VIP STATUS ACTIVE
          </Badge>
          <p className="text-sm text-muted-foreground">
            You can now recognize creators. Your identity stays encrypted for
            privacy.
          </p>
          <div className="bg-muted/50 p-2 border border-border text-xs rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-3 w-3" />
              <span>
                ID:{" "}
                {encryptedId
                  ? String(encryptedId).slice(0, 12) + "..."
                  : "Loading..."}
              </span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <Calendar className="h-3 w-3" />
              <span>
                Nominations this week: {nominatedThisWeek ? "1/1" : "0/1"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
