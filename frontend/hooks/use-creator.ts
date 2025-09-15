// hooks/useCreatorRegistry.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { FHEZamaCreatorABI } from "../abi/creator";
import { Address } from "viem";
import { Creator, mapContractResponseToCreator } from "@/lib/type";

// Contract address
const CONTRACT_ADDRESS = "0xC32370e7b8F020E627E3C8d48F764AECffFB9D2E";

// ------------------- WRITE HOOKS ------------------- //
type CreatorTuple = [
  string, // creatorAddress
  string, // name
  string, // profilePicture
  string, // metadata
  bigint // recognitionCount
];

export function useRegisterCreator() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function registerCreator(
    name: string,
    metadata: string,
    profilePicture: string
  ) {
    try {
      await writeContract({
        abi: FHEZamaCreatorABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "registerCreator",
        args: [name, metadata, profilePicture],
      });
    } catch (err) {
      console.error("❌ registerCreator error:", err);
    }
  }

  return { registerCreator, isPending, isConfirming, isSuccess, error };
}

export function useIncrementRecognitionCount() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function incrementRecognitionCount(creator: Address) {
    try {
      await writeContract({
        abi: FHEZamaCreatorABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "incrementRecognitionCount",
        args: [creator],
      });
    } catch (err) {
      console.error("❌ incrementRecognitionCount error:", err);
    }
  }

  return {
    incrementRecognitionCount,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

// ------------------- READ HOOKS ------------------- //

export function useGetCreatorByName(name: string) {
  return useReadContract({
    abi: FHEZamaCreatorABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorByName",
    args: [name],
  });
}
export function useGetCreatorByAddress(address: Address) {
  const { data, isError, isLoading, error } = useReadContract({
    abi: FHEZamaCreatorABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorByAddress",
    args: [address],
  });

  // Map the contract response to Creator interface
  const creator: Creator | undefined = data
    ? mapContractResponseToCreator(data as any)
    : undefined;

  return {
    data: creator,
    isError,
    isLoading,
    error,
    rawData: data, // Keep raw data available if needed
  };
}

export function useGetAllCreators() {
  return useReadContract({
    abi: FHEZamaCreatorABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getAllCreators",
  });
}

export function useGetCreatorCount() {
  return useReadContract({
    abi: FHEZamaCreatorABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorCount",
  });
}

export function useIsActiveCreator(creator: Address) {
  return useReadContract({
    abi: FHEZamaCreatorABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "isActiveCreator",
    args: [creator],
  });
}

export function useGetCreatorName(creator: Address) {
  return useReadContract({
    abi: FHEZamaCreatorABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getCreatorName",
    args: [creator],
  });
}
