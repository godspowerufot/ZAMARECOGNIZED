// hooks/useRecognition.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { FHEZamaRecognizeABI } from "@/abi/ZamaRecognition";
import { Address } from "viem";

// ------------------- TYPES ------------------- //

export interface Recognition {
  creator: Address;
  encryptedVIPId: any; // euint32 type from contract
  reason: string;
  weekNumber: bigint;
  creatorName: string;
  vipAddress: Address;
  timestamp: bigint;
}

export interface WeeklyRecognitionData {
  recognizedCreators: Address[];
  nominatingVIPs: Address[];
  totalRecognitions: bigint;
  mintedCount: bigint;
}

export interface SystemStats {
  totalCount: bigint;
  mintedCount: bigint;
  pendingCount: bigint;
  totalCreators: bigint;
  totalVIPs: bigint;
}

// Contract address (replace with deployed RecognitionMain contract)
const CONTRACT_ADDRESS = "0xc0ccA917853A15EABd54F2BEb01Ca72dfafB38d1";

// ------------------- WRITE HOOKS ------------------- //

// 1. Recognize a Creator (VIP only)
export function useRecognizeCreator() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function recognizeCreator(
    creatorName: string,
    creatorAddress: Address,
    encryptedReason: string,
    weekNumber: number
  ) {
    try {
      await writeContract({
        abi: FHEZamaRecognizeABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "recognizeCreator",
        args: [
          creatorName,
          creatorAddress,
          encryptedReason,
          BigInt(weekNumber),
        ],
      });
    } catch (err) {
      console.error("❌ recognizeCreator error:", err);
    }
  }

  return { recognizeCreator, isPending, isConfirming, isSuccess, error };
}

// 2. Mint Recognition Card (creator only)
export function useMintRecognitionCard() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function mintMyRecognitionCard(weekNumber: number) {
    try {
      await writeContract({
        abi: FHEZamaRecognizeABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "mintMyRecognitionCard",
        args: [BigInt(weekNumber)],
      });
    } catch (err) {
      console.error("❌ mintMyRecognitionCard error:", err);
    }
  }

  return { mintMyRecognitionCard, isPending, isConfirming, isSuccess, error };
}

// ------------------- READ HOOKS ------------------- //

// Get current week
export function useGetCurrentWeek() {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCurrentWeek",
  });
}

// Check if creator has pending recognition
export function useHasPendingRecognition(addr: Address, week: number) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "hasPendingRecognition",
    args: [addr, BigInt(week)],
  });
}

// Get recognition details of a token
export function useGetRecognitionDetails(tokenId: number) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getMyRecognitionDetails",
    args: [BigInt(tokenId)],
  });
}

// Get tokenURI for a recognition card
export function useTokenURI(tokenId: number) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "tokenURI",
    args: [BigInt(tokenId)],
  });
}

// Get total supply
export function useTotalSupply() {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "totalSupply",
  });
}

// ------------------- NEW QUERY HOOKS ------------------- //

// Get Creator Recognition Summary
export function useCreatorRecognitionSummary(creator: Address) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorRecognitionSummary",
    args: [creator],
  });
}

// Get Creator Pending Recognitions
export function useCreatorPendingRecognitions(creator: Address) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorPendingRecognitions",
    args: [creator],
  });
}

// Get Creator Minted Recognitions
export function useCreatorMintedRecognitions(creator: Address) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorMintedRecognitions",
    args: [creator],
  });
}

// Get Creator Recognition History
export function useCreatorRecognitionHistory(creator: Address) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorRecognitionHistory",
    args: [creator],
  });
}

// Get Creator Weekly Recognition
export function useCreatorWeeklyRecognition(creator: Address, week: number) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorWeeklyRecognition",
    args: [creator, BigInt(week)],
  });
}

// Get Weekly Recognition Data
export function useWeeklyRecognitionData(week: number) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getWeeklyRecognitionData",
    args: [BigInt(week)],
  });
}

// Get System Stats
export function useSystemStats() {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getSystemStats",
    args: [],
  });
}

// Get Recognition Reason
export function useRecognitionReason(tokenId: bigint) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getRecognitionReason",
    args: [tokenId],
  });
}

// Get Recognition Details for Owner
export function useMyRecognitionDetails(tokenId: bigint) {
  return useReadContract({
    abi: FHEZamaRecognizeABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getMyRecognitionDetails",
    args: [tokenId],
  });
}
