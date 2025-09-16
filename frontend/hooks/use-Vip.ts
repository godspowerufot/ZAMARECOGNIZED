// hooks/useVIPRegistry.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { FHEZamaVipABI } from "@/abi/Vip";
import { Address } from "viem";

// Contract address
const CONTRACT_ADDRESS = "0x54CD4b0b53cCE73711Db188C663e4278a9Dd90b4"; // replace with deployed VIPRegistry address
// ------------------- WRITE HOOKS ------------------- //

// 1. Register VIP (owner only)
export function useRegisterVIP() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function registerVIP(
    vipaddress: Address,
    inputEuint32: any,
    inputProof: any
  ) {
    try {
      await writeContract({
        abi: FHEZamaVipABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "registerVIP",
        args: [vipaddress, inputEuint32, inputProof],
      });
    } catch (err) {
      console.error("❌ registerVIP error:", err);
    }
  }

  return { registerVIP, isPending, isConfirming, isSuccess, error };
}

// 2. Become VIP (testing only)
export function useBecomeVIPForTesting() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function becomeVIPForTesting() {
    try {
      await writeContract({
        abi: FHEZamaVipABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "becomeVIPForTesting",
        args: [],
      });
    } catch (err) {
      console.error("❌ becomeVIPForTesting error:", err);
    }
  }

  return { becomeVIPForTesting, isPending, isConfirming, isSuccess, error };
}

// 3. Mark nominated
export function useMarkNominated() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function markNominated(vip: Address, week: number) {
    try {
      await writeContract({
        abi: FHEZamaVipABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "markNominated",
        args: [vip, BigInt(week)],
      });
    } catch (err) {
      console.error("❌ markNominated error:", err);
    }
  }

  return { markNominated, isPending, isConfirming, isSuccess, error };
}

// ------------------- READ HOOKS ------------------- //

// Check VIP status
export function useCheckVIPStatus(addr: Address) {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "checkVIPStatus",
    args: [addr],
  });
}

// Get encrypted VIP ID
export function useGetEncryptedVIPId(addr: Address) {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getEncryptedVIPId",
    args: [addr],
  });
}

// Has VIP nominated this week
export function useHasVIPNominatedThisWeek(addr: Address, week: number) {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "hasVIPNominatedThisWeek",
    args: [addr, BigInt(week)],
  });
}

// ------------------- NEW NOMINATION HOOKS ------------------- //

// Record a new nomination
export function useRecordNomination() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function recordNomination(
    vip: Address,
    creator: Address,
    creatorName: string,
    reason: string,
    week: number
  ) {
    try {
      await writeContract({
        abi: FHEZamaVipABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "recordNomination",
        args: [vip, creator, creatorName, reason, BigInt(week)],
      });
    } catch (err) {
      console.error("❌ recordNomination error:", err);
    }
  }

  return { recordNomination, isPending, isConfirming, isSuccess, error };
}

// Mark nomination as minted
export function useMarkNominationMinted() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function markNominationMinted(
    vip: Address,
    creator: Address,
    week: number,
    tokenId: bigint
  ) {
    try {
      await writeContract({
        abi: FHEZamaVipABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "markNominationMinted",
        args: [vip, creator, BigInt(week), tokenId],
      });
    } catch (err) {
      console.error("❌ markNominationMinted error:", err);
    }
  }

  return { markNominationMinted, isPending, isConfirming, isSuccess, error };
}

// ------------------- NEW QUERY HOOKS ------------------- //

// Get VIP nominations
export function useVIPNominations(addr: Address) {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getVIPNominations",
    args: [addr],
  });
}

// Get VIP statistics
export function useVIPStats(addr: Address) {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getVIPStats",
    args: [addr],
  });
}

// Get all VIPs
export function useAllVIPs() {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getAllVIPs",
    args: [],
  });
}

// Get total VIP count
export function useTotalVIPs() {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getTotalVIPs",
    args: [],
  });
}

// Get weekly statistics
export function useWeeklyStats(week: number) {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getWeeklyStats",
    args: [BigInt(week)],
  });
}

// Get all nominations
export function useAllNominations() {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getAllNominations",
    args: [],
  });
}

// Get system-wide nomination statistics
export function useSystemNominationStats() {
  return useReadContract({
    abi: FHEZamaVipABI.abi,
    address: CONTRACT_ADDRESS,
    functionName: "getSystemNominationStats",
    args: [],
  });
}

// ------------------- TYPES ------------------- //

export interface VIPNomination {
  creatorAddress: Address;
  creatorName: string;
  reason: string;
  weekNumber: bigint;
  timestamp: bigint;
  isMinted: boolean;
  tokenId: bigint;
}
