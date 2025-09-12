"use client";

import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  isWalletConnected: boolean;
  setIsWalletConnected: (value: boolean) => void;
};

export default function WalletConnect({
  isWalletConnected,
  setIsWalletConnected,
}: Props) {
  const { address, isConnected } = useAccount();
  console.log(isWalletConnected);
  return (
    <div>
      {!isWalletConnected ? (
        <ConnectButton.Custom>
          {({ openConnectModal }) => (
            <Button
              onClick={() => {
                openConnectModal(); // open wallet modal
                setIsWalletConnected(true); // update parent only when button is clicked
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-gaming text-sm"
            >
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </ConnectButton.Custom>
      ) : isConnected ? ( // only show badge if wallet really connected
        <Badge
          variant="secondary"
          className="font-gaming text-xs px-2 py-1 flex items-center gap-1"
        >
          <Wallet className="h-3 w-3" />
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </Badge>
      ) : null}
    </div>
  );
}
