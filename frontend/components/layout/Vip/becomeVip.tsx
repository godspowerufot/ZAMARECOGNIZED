"use client";

import { useEffect, useState } from "react";
import { Shield, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAccount } from "wagmi";
import {
  useRegisterVIP,
  useCheckVIPStatus,
  useHasVIPNominatedThisWeek,
  useGetEncryptedVIPId,
} from "@/hooks/use-Vip";
import { useFhe } from "@/config/FheRelayey"; // Your updated context

const CONTRACT_ADDRESS = "0x96A1B93F3BB71Ee4779a28c85BDC8BB756F2c1f9";

interface VIPStatusCardProps {
  isVIP: boolean;
  setIsVIP: (value: boolean) => void;
}

export default function VIPStatusCard({ isVIP, setIsVIP }: VIPStatusCardProps) {
  const { address, isConnected } = useAccount();
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Use the updated FHE context
  const fhe = useFhe();

  const { registerVIP, isPending, isConfirming, isSuccess, error } =
    useRegisterVIP();
  const { data: vipStatus } = useCheckVIPStatus(address as `0x${string}`);
  const { data: encryptedId } = useGetEncryptedVIPId(address as `0x${string}`);
  const { data: nominatedThisWeek } = useHasVIPNominatedThisWeek(
    address as `0x${string}`,
    1
  );

  async function handleBecomeVIP() {
    console.log("Starting VIP registration process...");

    if (!isConnected || !address) {
      console.warn("Wallet not connected or no address");
      return;
    }

    if (!fhe || !fhe.isReady) {
      console.warn("FHE not ready yet");
      return;
    }

    setIsEncrypting(true);

    try {
      console.log("Creating encrypted input...");

      // Use the context's encryptNumber function
      const vipId = 123;
      const encryptionResult = await fhe.encryptNumber(
        vipId,
        CONTRACT_ADDRESS,
        address
      );

      console.log("Encryption successful:", encryptionResult);

      // Call registerVIP with the encrypted data
      await registerVIP(
        address as `0x${string}`,
        encryptionResult.encryptedData, // Already a hex string
        encryptionResult.inputProof as `0x${string}` // Already a hex string
      );

      console.log("VIP registration transaction submitted");
    } catch (err) {
      console.error("❌ handleBecomeVIP error:", err);
    } finally {
      setIsEncrypting(false);
    }
  }

  // Alternative: Use createEncryptedInput for multiple values
  async function handleBecomeVIPAlternative() {
    if (!fhe || !fhe.isReady || !address) return;

    setIsEncrypting(true);
    try {
      // For multiple values or more control
      const result = await fhe.createEncryptedInput(
        CONTRACT_ADDRESS,
        address,
        [123] // Array of values to encrypt
      );

      await registerVIP(
        address as `0x${string}`,
        result.handles[0], // First encrypted handle
        result.inputProof as `0x${string}`
      );
    } catch (err) {
      console.error("❌ Alternative handleBecomeVIP error:", err);
    } finally {
      setIsEncrypting(false);
    }
  }

  // Sync hook result with local state
  useEffect(() => {
    if (vipStatus !== undefined) {
      setIsVIP(Boolean(vipStatus));
    }
  }, [vipStatus, setIsVIP]);

  // Handle successful registration
  useEffect(() => {
    if (isSuccess) {
      console.log("✅ VIP registration successful!");
    }
  }, [isSuccess]);

  // Handle registration errors
  useEffect(() => {
    if (error) {
      console.error("❌ VIP registration error:", error);
    }
  }, [error]);

  const isProcessing = isPending || isConfirming || isEncrypting;

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

          <Button
            onClick={handleBecomeVIP}
            disabled={!isConnected || isProcessing || !fhe?.isReady}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-gaming"
          >
            {!isConnected
              ? "CONNECT WALLET FIRST"
              : !fhe?.isReady
              ? "LOADING FHE..."
              : isEncrypting
              ? "ENCRYPTING..."
              : isPending
              ? "SUBMITTING..."
              : isConfirming
              ? "CONFIRMING..."
              : "BECOME VIP"}
          </Button>
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
