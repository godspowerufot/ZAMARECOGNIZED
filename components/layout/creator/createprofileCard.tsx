"use client";

import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Hash } from "lucide-react";
import { useRegisterCreator } from "@/hooks/use-creator";

interface CreatorForm {
  name: string;
  avatar: string;
  metadata: string;
}

interface CreatorProfileCardProps {
  isWalletConnected: boolean;
  walletAddress?: string;
}

export default function CreatorProfileCard({
  isWalletConnected,
  walletAddress,
}: CreatorProfileCardProps) {
  const [creatorForm, setCreatorForm] = useState<CreatorForm>({
    name: "",
    avatar: "",
    metadata: "",
  });

  const { registerCreator, isPending, isConfirming, isSuccess } =
    useRegisterCreator();

  const handleRegisterCreator = async () => {
    await registerCreator(
      creatorForm.name,
      creatorForm.avatar,
      creatorForm.metadata
    );
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-gaming text-primary">
          CREATE CREATOR PROFILE
        </CardTitle>
        <CardDescription>
          Register as a creator to receive recognition from VIPs and mint NFT
          badges. Your profile will be stored on-chain.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Creator Name/Handle</label>
          <Input
            placeholder="e.g., CryptoJohn (must be unique)"
            className="bg-input border-border"
            value={creatorForm.name}
            onChange={(e) =>
              setCreatorForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Avatar</label>
          <Textarea
            placeholder="Insert your avatar as a Link"
            className="bg-input border-border"
            value={creatorForm.avatar}
            onChange={(e) =>
              setCreatorForm((prev) => ({ ...prev, avatar: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Metadata (Optional)</label>
          <Input
            placeholder="Additional information about your work"
            className="bg-input border-border"
            value={creatorForm.metadata}
            onChange={(e) =>
              setCreatorForm((prev) => ({ ...prev, metadata: e.target.value }))
            }
          />
        </div>

        {isWalletConnected && (
          <div className="bg-muted/50 p-3 border border-border text-xs">
            <div className="flex items-center space-x-2">
              <Hash className="h-3 w-3" />
              <span>Will be registered to: {walletAddress}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleRegisterCreator}
          disabled={
            !creatorForm.name ||
            !creatorForm.avatar ||
            !isWalletConnected ||
            isPending ||
            isConfirming
          }
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-gaming"
        >
          {!isWalletConnected
            ? "CONNECT WALLET FIRST"
            : isPending
            ? "Waiting for wallet..."
            : isConfirming
            ? "Confirming..."
            : isSuccess
            ? "Creator Registered ✅"
            : "REGISTER AS CREATOR"}
        </Button>
      </CardContent>
    </Card>
  );
}
