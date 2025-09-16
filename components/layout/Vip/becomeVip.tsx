// VIP Status Card - Broken into separate functions
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
import { getFheInstance, initializeFheInstance } from "@/utils/fheinstance";
import { useEthersSigner } from "@/app/layout";
import { ethers, hexlify } from "ethers";
import { FHEZamaVipABI } from "@/abi/Vip";

const CONTRACT_ADDRESS = "0x54CD4b0b53cCE73711Db188C663e4278a9Dd90b4";

interface VIPStatusCardProps {
  isVIP: boolean;
  setIsVIP: (value: boolean) => void;
}

// 1. VIP Status Check Function
function useVIPStatusCheck(
  address: string | undefined,
  setIsVIP: (value: boolean) => void
) {
  const { data: vipStatus } = useCheckVIPStatus(address as `0x${string}`);

  useEffect(() => {
    if (vipStatus !== undefined) {
      console.log(
        `🔄 VIP status updated for ${address}: ${Boolean(vipStatus)}`
      );
      setIsVIP(Boolean(vipStatus));
    }
  }, [vipStatus, setIsVIP, address]);
  console.log("vip sttatus contract:", vipStatus);

  return { vipStatus };
}

// 2. VIP ID Retrieval Function
function useVIPIdDisplay(address: string | undefined, isVIP: boolean) {
  const { data: encryptedId } = useGetEncryptedVIPId(address as `0x${string}`);

  const getDisplayId = () => {
    if (!isVIP) return null;
    if (!encryptedId) return "Loading...";
    return String(encryptedId).slice(0, 22) + "...";
  };

  console.log("encrypted id", encryptedId);
  return { encryptedId, displayId: getDisplayId() };
}

// 3. FHE Initialization Function
async function initializeFHE(): Promise<any> {
  console.log("🔐 Initializing FHE instance...");

  let fhe = getFheInstance();
  if (!fhe) {
    console.log("📦 No FHE instance found, creating new one...");
    fhe = await initializeFheInstance();
  }

  if (!fhe) {
    throw new Error("Failed to initialize FHE instance");
  }

  console.log("✅ FHE instance ready");
  return fhe;
}

// 4. VIP ID Encryption Function
async function encryptVIPId(
  fhe: any,
  contractAddress: string,
  userAddress: string
) {
  const randomVipId = Math.floor(Math.random() * 1000000);
  console.log(`🎲 Generated random VIP ID: ${randomVipId}`);

  console.log("🔏 Creating encrypted input...");
  const ciphertext = await fhe.createEncryptedInput(
    contractAddress,
    userAddress
  );

  console.log("➕ Adding random VIP ID to ciphertext...");
  ciphertext.add32(Number(randomVipId));

  console.log("🔑 Encrypting ciphertext...");
  const { handles, inputProof } = await ciphertext.encrypt();

  if (!handles || handles.length === 0) {
    throw new Error("No handles generated from encryption");
  }

  if (!inputProof) {
    throw new Error("Input proof not generated");
  }

  const handleHex = hexlify(handles[0]);
  const proofHex = hexlify(inputProof);

  console.log("📤 Encrypted data prepared", {
    handles,
    inputProof: "available",
  });

  return { handleHex, proofHex, randomVipId };
}

// 5. Contract Registration Function
async function registerVIPOnContract(
  address: any,
  signer: any,
  contractAddress: string,
  handleHex: string,
  proofHex: string
) {
  if (!signer) {
    throw new Error("Signer not available");
  }

  const VIPContract = new ethers.Contract(
    contractAddress,
    FHEZamaVipABI.abi,
    signer
  );

  console.log("📨 Sending encrypted registration to contract...");
  console.log("Handle:", handleHex);
  console.log("Proof:", proofHex);

  const registerTx = await VIPContract.registerVIP(
    address,
    handleHex,
    proofHex
  );
  const receipt = await registerTx.wait();

  console.log("Transaction receipt:", receipt);
  console.log("🎉 VIP registration transaction sent successfully");

  return receipt;
}

// 6. Main VIP Registration Handler
function useVIPRegistration(address: string | undefined, isConnected: boolean) {
  const [isEncrypting, setIsEncrypting] = useState(false);
  const signer = useEthersSigner();
  const { registerVIP, isPending, isConfirming, isSuccess, error } =
    useRegisterVIP();

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
      // Initialize FHE
      const fhe = await initializeFHE();

      // Encrypt VIP ID
      const { handleHex, proofHex } = await encryptVIPId(
        fhe,
        CONTRACT_ADDRESS,
        address
      );

      // Register on contract
      await registerVIPOnContract(
        address,
        signer,
        CONTRACT_ADDRESS,
        handleHex,
        proofHex
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

  return {
    handleBecomeVIP,
    isProcessing: isPending || isConfirming || isEncrypting,
    isSuccess,
    error,
    isEncrypting,
  };
}

// 7. Test VIP Registration Handler
function useTestVIPRegistration(
  address: string | undefined,
  isConnected: boolean
) {
  const {
    becomeVIPForTesting,
    isPending: isTestPending,
    isConfirming: isTestConfirming,
    isSuccess: isTestSuccess,
    error: testError,
  } = useBecomeVIPForTesting();

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

  return {
    handleBecomeVIPForTesting,
    isTestProcessing: isTestPending || isTestConfirming,
    isTestSuccess,
    testError,
  };
}

// 8. VIP Info Display Component
function VIPInfoDisplay({
  displayId,
  nominatedThisWeek,
}: {
  displayId: string | null;
  nominatedThisWeek: any;
}) {
  return (
    <div className="bg-muted/50 p-2 border border-border text-xs rounded-lg">
      <div className="flex items-center space-x-2">
        <Shield className="h-3 w-3" />
        <span>ID: {displayId || "Loading..."}</span>
      </div>
      <div className="flex items-center space-x-2 mt-1">
        <Calendar className="h-3 w-3" />
        <span>Nominations this week: {nominatedThisWeek ? "1/1" : "0/1"}</span>
      </div>
    </div>
  );
}

// 9. VIP Features Info Component
function VIPFeaturesInfo() {
  return (
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
  );
}

// 10. Error Display Component
function ErrorDisplay({ error, testError }: { error: any; testError: any }) {
  if (!error && !testError) return null;

  return (
    <>
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
    </>
  );
}

// 11. VIP Registration Buttons Component
function VIPRegistrationButtons({
  isConnected,
  isProcessing,
  isTestProcessing,
  isEncrypting,
  isPending,
  handleBecomeVIP,
  handleBecomeVIPForTesting,
}: {
  isConnected: boolean;
  isProcessing: boolean;
  isTestProcessing: boolean;
  isEncrypting: boolean;
  isPending: boolean;
  handleBecomeVIP: () => void;
  handleBecomeVIPForTesting: () => void;
}) {
  return (
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
            <span>PROCESSING...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <TestTube className="h-4 w-4" />
            <span>BECOME VIP (TEST)</span>
          </div>
        )}
      </Button>
    </div>
  );
}

// 12. Main VIP Status Card Component
export default function VIPStatusCard({ isVIP, setIsVIP }: VIPStatusCardProps) {
  const { address, isConnected } = useAccount();
  const { data: nominatedThisWeek } = useHasVIPNominatedThisWeek(
    address as `0x${string}`,
    1
  );

  // Use custom hooks for VIP status and registration
  const { vipStatus } = useVIPStatusCheck(address, setIsVIP);
  const { displayId } = useVIPIdDisplay(address, isVIP);
  const { handleBecomeVIP, isProcessing, isSuccess, error, isEncrypting } =
    useVIPRegistration(address, isConnected);
  const {
    handleBecomeVIPForTesting,
    isTestProcessing,
    isTestSuccess,
    testError,
  } = useTestVIPRegistration(address, isConnected);

  // Handle success logging
  useEffect(() => {
    if (isSuccess) {
      console.log(`✅ VIP registration successful for address: ${address}`);
    }
  }, [isSuccess, address]);

  useEffect(() => {
    if (isTestSuccess) {
      console.log(
        `✅ VIP test registration successful for address: ${address}`
      );
    }
  }, [isTestSuccess, address]);

  // Debug logging
  console.log("🔍 VIPStatusCard state:", {
    address,
    isConnected,
    isVIP,
    vipStatus,
    displayId,
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

          <VIPFeaturesInfo />
          <ErrorDisplay error={error} testError={testError} />
          <VIPRegistrationButtons
            isConnected={isConnected}
            isProcessing={isProcessing}
            isTestProcessing={isTestProcessing}
            isEncrypting={isEncrypting}
            isPending={false}
            handleBecomeVIP={handleBecomeVIP}
            handleBecomeVIPForTesting={handleBecomeVIPForTesting}
          />
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
          <VIPInfoDisplay
            displayId={displayId}
            nominatedThisWeek={nominatedThisWeek}
          />
        </div>
      )}
    </>
  );
}
