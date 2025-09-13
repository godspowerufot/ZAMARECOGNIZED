// hooks/useVIPRegistry.ts
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { FHEZamaVipABI } from "@/abi/Vip";
import { Address } from "viem";

// Contract address
const CONTRACT_ADDRESS = "0xc2C7BD895c61173Bb8D4119a8b907622b1aeb5E4"; // replace with deployed VIPRegistry address

// ------------------- WRITE HOOKS ------------------- //

// 1. Register VIP (owner only)
export function useRegisterVIP() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  async function registerVIP(inputEuint32: any, inputProof: `0x${string}`) {
    try {
      await writeContract({
        abi: FHEZamaVipABI.abi,
        address: CONTRACT_ADDRESS,
        functionName: "registerVIP",
        args: [inputEuint32, inputProof],
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
