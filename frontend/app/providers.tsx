"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAccount } from "wagmi";
import { Creator, VIP, Recognition } from "@/lib/type";

interface AppContextType {
  isWalletConnected: boolean;
  setIsWalletConnected: (value: boolean) => void;
  isVIP: boolean;
  setIsVIP: (value: boolean) => void;
  isCreator: boolean;
  setIsCreator: (value: boolean) => void;
  currentCreatorProfile: Creator | null;
  setCurrentCreatorProfile: (value: Creator | null) => void;
  currentVIPProfile: VIP | null;
  setCurrentVIPProfile: (value: VIP | null) => void;
  creators: Creator[];
  setCreators: (value: Creator[]) => void;
  recognitions: Recognition[];
  setRecognitions: (value: Recognition[]) => void;
  notifications: string[];
  setNotifications: (value: string[]) => void;
  showNotification: boolean;
  setShowNotification: (value: boolean) => void;
  currentWeek: number;
  walletAddress: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isVIP, setIsVIP] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [currentCreatorProfile, setCurrentCreatorProfile] =
    useState<Creator | null>(null);
  const [currentVIPProfile, setCurrentVIPProfile] = useState<VIP | null>(null);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string>("");

  const { address, isConnected } = useAccount();

  useEffect(() => {
    const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    setCurrentWeek(weekNumber);
  }, []);

  useEffect(() => {
    if (isConnected && address) {
      setIsWalletConnected(true);
      setWalletAddress(address);
    } else {
      setIsWalletConnected(false);
      setWalletAddress("");
    }
  }, [isConnected, address]);

  return (
    <AppContext.Provider
      value={{
        isWalletConnected,
        setIsWalletConnected,
        isVIP,
        setIsVIP,
        isCreator,
        setIsCreator,
        currentCreatorProfile,
        setCurrentCreatorProfile,
        currentVIPProfile,
        setCurrentVIPProfile,
        creators,
        setCreators,
        recognitions,
        setRecognitions,
        notifications,
        setNotifications,
        showNotification,
        setShowNotification,
        currentWeek,
        walletAddress,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
