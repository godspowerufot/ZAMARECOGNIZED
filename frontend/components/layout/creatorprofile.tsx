"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Hash, Gift, Trophy, Shield, CheckCircle, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreatorProfileCard from "./creator/createprofileCard";
import { useAccount } from "wagmi";
import {
  useGetCreatorByAddress,
  useGetCreatorByName,
  useGetCreatorName,
} from "@/hooks/use-creator";
import { useEffect } from "react";
type CreatorProfileProps = {
  isCreator: boolean;
  isWalletConnected: boolean;
  walletAddress: string;
  creatorForm: { name: string; avatar: string; metadata: string };
  setCreatorForm: React.Dispatch<
    React.SetStateAction<{ name: string; avatar: string; metadata: string }>
  >;
  setIsCreator: React.Dispatch<React.SetStateAction<boolean>>;
  handleRegisterCreator: () => void;
  handleMintBadge: (id: string) => void;
  currentCreatorProfile: any;
  recognitions: any[];
  setCurrentCreatorProfile: React.Dispatch<React.SetStateAction<any>>; // Add this prop

  currentWeek: number;
};

export default function CreatorProfile({
  isCreator,
  isWalletConnected,
  walletAddress,
  creatorForm,
  setIsCreator,
  setCreatorForm,
  handleRegisterCreator,
  handleMintBadge,
  setCurrentCreatorProfile, // Add this prop
  currentCreatorProfile,
  recognitions,
  currentWeek,
}: CreatorProfileProps) {
  const { address, isConnected } = useAccount();
  const {
    data: creatorProfile,
    error,
    isLoading,
  } = useGetCreatorByAddress(address as `0x${string}`);
  // Second hook to get creator profile by name (only runs when creatorName exists)

  useEffect(() => {
    if (isConnected && creatorProfile) {
      setCurrentCreatorProfile(creatorProfile);
      setIsCreator(true);
      console.log("Creator profile (object):", creatorProfile);
    } else {
      setCurrentCreatorProfile(null);
      setIsCreator(false);
    }
  }, [creatorProfile, isConnected, setCurrentCreatorProfile, setIsCreator]);
  return (
    <div className="space-y-6">
      {!isCreator ? (
        <CreatorProfileCard
          isWalletConnected={isConnected}
          walletAddress={address}
        />
      ) : (
        <div className="space-y-6">
          {/* Dashboard */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-gaming text-primary">
                YOUR CREATOR DASHBOARD
              </CardTitle>
              <CardDescription>
                Track your recognitions and claim NFT badges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="font-gaming text-2xl text-primary">
                    {currentCreatorProfile?.recognitions || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    TOTAL RECOGNITIONS
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-gaming text-2xl text-secondary">
                    {currentCreatorProfile?.isRecognizedThisWeek ? "1" : "0"}
                  </p>
                  <p className="text-sm text-muted-foreground">THIS WEEK</p>
                </div>
                <div className="text-center">
                  <p className="font-gaming text-2xl text-primary">
                    {
                      recognitions.filter(
                        (r) =>
                          r.creatorId === currentCreatorProfile?.id && r.tokenId
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    NFT BADGES OWNED
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badge Claim */}
          {currentCreatorProfile?.hasPendingBadge && (
            <Card className="bg-secondary/10 border-secondary">
              <CardHeader>
                <CardTitle className="font-gaming text-secondary flex items-center">
                  <Gift className="mr-2 h-5 w-5" />
                  🏆 CLAIM YOUR RECOGNITION NFT BADGE
                </CardTitle>
                <CardDescription>
                  Congratulations! You've been recognized this week. Mint your
                  unique NFT badge to your wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-card p-4 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">
                        🎖️ Recognition NFT Badge - Week {currentWeek}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        A unique ERC-721 NFT badge showing the week you were
                        recognized
                      </p>
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">
                      READY TO MINT
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => handleMintBadge(currentCreatorProfile.id)}
                  className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-gaming"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  MINT MY RECOGNITION NFT BADGE
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Profile */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="font-gaming text-primary">
                YOUR PROFILE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      currentCreatorProfile?.profilePicture ||
                      "/placeholder.svg"
                    }
                  />
                  <AvatarFallback className="bg-muted font-gaming">
                    {currentCreatorProfile?.name?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-gaming text-lg">
                    {currentCreatorProfile?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentCreatorProfile?.bio}
                  </p>
                </div>
              </div>
              <div className="bg-muted/50 p-3 border border-border text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <Hash className="h-3 w-3" />
                  <span>Wallet Address: {currentCreatorProfile?.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    Status:{" "}
                    {currentCreatorProfile?.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {currentCreatorProfile?.metadata && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-3 w-3" />
                    <span>bio: {currentCreatorProfile.metadata}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* NFT Collection */}
          {recognitions.filter(
            (r) => r.creatorId === currentCreatorProfile?.id && r.tokenId
          ).length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="font-gaming text-primary">
                  YOUR NFT BADGE COLLECTION
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recognitions
                    .filter(
                      (r) =>
                        r.creatorId === currentCreatorProfile?.id && r.tokenId
                    )
                    .map((recognition) => (
                      <div
                        key={recognition.id}
                        className="bg-muted/50 p-3 border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Trophy className="h-4 w-4 text-primary" />
                            <span className="font-gaming text-sm">
                              Recognition NFT #{recognition.tokenId}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            Week {recognition.weekNumber}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {atob(recognition.encryptedReason || "")}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span>
                            VIP ID: {recognition.encryptedVIPId?.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
