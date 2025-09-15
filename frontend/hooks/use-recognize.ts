// hooks/useRecognition.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { FHEZamaRecognizeABI } from "@/abi/ZamaRecognition";
import { Address } from "viem";

// Contract address (replace with deployed RecognitionMain contract)
const CONTRACT_ADDRESS = "0x3844108c86A4e4dd029daBFa81Ae6Db99Db279a0";

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
