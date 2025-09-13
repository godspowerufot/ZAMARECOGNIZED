"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Address } from "viem";

import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Star,
  Zap,
  Users,
  Award,
  Wallet,
  Menu,
  X,
  Home,
  UserPlus,
  Crown,
  Bell,
  Gift,
  Clock,
  CheckCircle,
  Shield,
  Hash,
  Calendar,
  BarChart3,
} from "lucide-react";
import WalletConnect from "@/components/ConnectButton";
import CreatorProfile from "@/components/layout/creatorprofile";
import { Creator, Recognition, VIP } from "@/lib/type";
import CreatorsDirectory from "@/components/layout/creator/creatorCard";
import VIPStatusCard from "@/components/layout/Vip/becomeVip";
import RecognitionCard from "@/components/layout/recognize/recognize";
// import { useFhe } from "@/config/FheRelayey";
import { useRecognizeCreator } from "@/hooks/use-recognize";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { FHEZamaVipABI } from "@/abi/Vip";
import { useEthersSigner } from "./layout";

export default function ZamaRecognitionSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isVIP, setIsVIP] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [recognitionReason, setRecognitionReason] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const { address, isConnected } = useAccount();

  // const fhe = useFhe();
  const signer = useEthersSigner();
  const [creatorForm, setCreatorForm] = useState({
    name: "",
    avatar: "",
    metadata: "",
  });

  const [currentCreatorProfile, setCurrentCreatorProfile] =
    useState<Creator | null>(null);

  const [currentVIPProfile, setCurrentVIPProfile] = useState<VIP | null>(null);

  const [creators, setCreators] = useState<Creator[]>([]);

  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  // 🔗 hook from wagmi
  const { recognizeCreator, isPending, isConfirming, isSuccess, error } =
    useRecognizeCreator();
  useEffect(() => {
    const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
    setCurrentWeek(weekNumber);
  }, []);

  useEffect(() => {
    if (
      isCreator &&
      currentCreatorProfile?.isRecognizedThisWeek &&
      currentCreatorProfile?.hasPendingBadge
    ) {
      setNotifications((prev) => [
        ...prev,
        `Congratulations! You've been recognized this week!`,
      ]);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [
    currentCreatorProfile?.isRecognizedThisWeek,
    currentCreatorProfile?.hasPendingBadge,
    isCreator,
  ]);

  const handleConnectWallet = () => {
    setIsWalletConnected(true);
  };

  const handleBecomeVIP = () => {
    if (!isWalletConnected) {
      setNotifications((prev) => [...prev, "Please connect your wallet first"]);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    const vipProfile: VIP = {
      id: Date.now().toString(),
      name: `VIP_${walletAddress.slice(-4)}`,
      isConnected: true,
      address: walletAddress,
      encryptedId: `encrypted_${Math.random().toString(16).substr(2, 8)}`,
      hasNominatedThisWeek: false,
    };

    setCurrentVIPProfile(vipProfile);
    setIsVIP(true);
    setNotifications((prev) => [
      ...prev,
      "VIP registration successful! Your identity is encrypted for privacy.",
    ]);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleRegisterCreator = () => {
    if (!creatorForm.name || !creatorForm.avatar) return;
    if (!isWalletConnected) {
      setNotifications((prev) => [...prev, "Please connect your wallet first"]);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    // Check if name is already taken
    const nameExists = creators.some(
      (c) => c.name.toLowerCase() === creatorForm.name.toLowerCase()
    );
    if (nameExists) {
      setNotifications((prev) => [
        ...prev,
        "Creator name already taken. Please choose another.",
      ]);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      return;
    }

    const newCreator: Creator = {
      id: Date.now().toString(),
      name: creatorForm.name,
      avatar: creatorForm.avatar || "/creator-avatar.png",
      recognitionCount: 0,
      recognitions: 0,
      isRecognizedThisWeek: false,
      hasPendingBadge: false,
      recognitionStatus: "waiting",
      isActive: true,
      creatorAddress: walletAddress,
      metadata: creatorForm.metadata || creatorForm.avatar,
      profilePicture: creatorForm.avatar || "/creator-avatar.png",
    };

    setCreators((prev) => [...prev, newCreator]);
    setCurrentCreatorProfile(newCreator);
    setIsCreator(true);
    setCreatorForm({ name: "", avatar: "", metadata: "" });
    setActiveTab("dashboard");

    setNotifications((prev) => [
      ...prev,
      `Creator profile registered successfully! Welcome, ${newCreator.name}!`,
    ]);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleRecognizeCreator = async (creator: Creator) => {
    console.log("🎯 Starting recognition process for:", creator.name);

    if (!creator?.creatorAddress) {
      console.warn("Missing creator address");
      return;
    }

    const reasonText = recognitionReason.trim() || "Great work this week!";

    try {
      // if (!fhe) {
      //   console.log("Still loading FHE...");
      //   return;
      // }

      const contractAddress = "0x4101e9c61F5CEC606A9A9b884469fD15dB270722";

      // Create encrypted input (string instead of int)

      setRecognitionReason("");
      setSelectedCreator(null);
      console.log("🎉 Recognition submitted successfully!");
    } catch (err) {
      console.error("❌ handleRecognizeCreator error:", err);
    }
  };

  // Alternative approach if the above doesn't work:

  const handleMintBadge = (creatorId: string) => {
    const creator = creators.find((c) => c.id === creatorId);
    if (!creator) return;

    const recognition = recognitions.find(
      (r) => r.creatorId === creatorId && r.weekNumber === currentWeek
    );
    if (!recognition) return;

    // Simulate NFT minting
    const tokenId = Math.floor(Math.random() * 10000) + 1;
    const updatedRecognition = { ...recognition, tokenId };

    setRecognitions((prev) =>
      prev.map((r) => (r.id === recognition.id ? updatedRecognition : r))
    );

    setCreators((prev) =>
      prev.map((c) =>
        c.id === creatorId
          ? {
              ...c,
              hasPendingBadge: false,
              recognitionStatus: "claimed",
            }
          : c
      )
    );

    if (currentCreatorProfile?.id === creatorId) {
      setCurrentCreatorProfile((prev) =>
        prev
          ? {
              ...prev,
              hasPendingBadge: false,
              recognitionStatus: "claimed",
            }
          : null
      );
    }

    setNotifications((prev) => [
      ...prev,
      `🎉 Recognition NFT #${tokenId} minted successfully! Badge added to your wallet.`,
    ]);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const navigationItems = [
    { id: "dashboard", label: "DASHBOARD", icon: Home },
    { id: "creators", label: "CREATORS", icon: Users },
    { id: "profile", label: "CREATOR PROFILE", icon: UserPlus },
    { id: "recognition", label: "MY RECOGNITION", icon: Award },
    { id: "vip", label: "BECOME VIP", icon: Crown },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {showNotification && notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-secondary text-secondary-foreground p-4 border border-border shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <p className="font-gaming text-xs">
              {notifications[notifications.length - 1]}
            </p>
          </div>
        </div>
      )}

      {/* ... existing sidebar code ... */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-gaming text-sm text-primary">ZAMA</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: "dashboard", label: "DASHBOARD", icon: Home },
            { id: "creators", label: "CREATORS", icon: Users },
            { id: "profile", label: "CREATOR PROFILE", icon: UserPlus },
            { id: "recognition", label: "MY RECOGNITION", icon: Award },
            { id: "vip", label: "BECOME VIP", icon: Crown },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id === "vip" ? "dashboard" : item.id);
                  if (item.id === "vip") handleBecomeVIP();
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left font-gaming text-xs transition-colors duration-200 ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <header className="border-b border-border bg-card">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Zap className="h-8 w-8 text-primary" />
                  <h1 className="font-gaming text-xl text-primary">
                    ZAMA RECOGNITION
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="font-gaming text-xs">
                  <Calendar className="mr-1 h-3 w-3" />
                  WEEK {currentWeek}
                </Badge>
                {isVIP && (
                  <Badge variant="secondary" className="font-gaming text-xs">
                    <Crown className="mr-1 h-3 w-3" />
                    VIP
                    {currentVIPProfile?.encryptedId && (
                      <Shield className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                )}
                {isCreator && (
                  <Badge variant="outline" className="font-gaming text-xs">
                    <UserPlus className="mr-1 h-3 w-3" />
                    CREATOR
                  </Badge>
                )}

                <WalletConnect
                  isWalletConnected={isWalletConnected}
                  setIsWalletConnected={setIsWalletConnected}
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 py-8">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="font-gaming text-3xl text-primary">
                  DIGITAL RECOGNITION SYSTEM
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Like a digital "Employee of the Month" program for creators,
                  with privacy features built in using encrypted VIP identities.
                </p>
              </div>

              {isCreator && currentCreatorProfile?.hasPendingBadge && (
                <Card className="bg-secondary/10 border-secondary animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Bell className="h-5 w-5 text-secondary animate-bounce" />
                        <div>
                          <p className="font-gaming text-sm text-secondary">
                            🎉 RECOGNITION RECEIVED!
                          </p>
                          <p className="text-xs text-muted-foreground">
                            You have a recognition NFT badge to claim - Week{" "}
                            {currentWeek}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Shield className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              VIP identity encrypted for privacy
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          handleMintBadge(currentCreatorProfile.id)
                        }
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-gaming text-xs"
                      >
                        <Gift className="mr-1 h-3 w-3" />
                        MINT NFT BADGE
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ... existing recognition status card ... */}
              {isCreator && currentCreatorProfile && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-gaming text-primary flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      YOUR RECOGNITION STATUS
                    </CardTitle>
                    <CardDescription>
                      Track your weekly recognition progress and NFT badges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {currentCreatorProfile.recognitionStatus ===
                          "waiting" && (
                          <>
                            <Clock className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-gaming text-sm">
                                WAITING FOR RECOGNITION
                              </p>
                              <p className="text-xs text-muted-foreground">
                                VIPs are browsing creators and recognizing good
                                work
                              </p>
                            </div>
                          </>
                        )}
                        {currentCreatorProfile.recognitionStatus ===
                          "recognized" && (
                          <>
                            <Bell className="h-8 w-8 text-secondary" />
                            <div>
                              <p className="font-gaming text-sm text-secondary">
                                RECOGNIZED THIS WEEK!
                              </p>
                              <p className="text-xs text-muted-foreground">
                                You've been nominated for an award - claim your
                                NFT badge
                              </p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Hash className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  Ready to mint as NFT
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                        {currentCreatorProfile.recognitionStatus ===
                          "claimed" && (
                          <>
                            <CheckCircle className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-gaming text-sm text-primary">
                                NFT BADGE CLAIMED
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Your recognition NFT has been minted
                                successfully
                              </p>
                              {recognitions.find(
                                (r) =>
                                  r.creatorId === currentCreatorProfile.id &&
                                  r.tokenId
                              )?.tokenId && (
                                <div className="flex items-center space-x-1 mt-1">
                                  <Hash className="h-3 w-3 text-primary" />
                                  <span className="text-xs text-primary">
                                    Token #
                                    {
                                      recognitions.find(
                                        (r) =>
                                          r.creatorId ===
                                            currentCreatorProfile.id &&
                                          r.tokenId
                                      )?.tokenId
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <Badge
                        variant={
                          currentCreatorProfile.recognitionStatus ===
                          "recognized"
                            ? "default"
                            : "outline"
                        }
                        className="font-gaming text-xs"
                      >
                        {currentCreatorProfile.recognitionStatus.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ... existing cards with enhanced VIP section ... */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-gaming text-primary flex items-center">
                      <Crown className="mr-2 h-5 w-5" />
                      VIP ACCESS
                    </CardTitle>
                    <CardDescription>
                      Get VIP access to recognize and reward outstanding
                      creators with encrypted identity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <VIPStatusCard isVIP={isVIP} setIsVIP={setIsVIP} />
                  </CardContent>
                </Card>

                {/* ... existing creator registration card ... */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="font-gaming text-primary flex items-center">
                      <UserPlus className="mr-2 h-5 w-5" />
                      CREATOR REGISTRATION
                    </CardTitle>
                    <CardDescription>
                      Register as a creator to receive recognition from VIPs and
                      mint NFT badges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!isCreator ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Create your profile so VIPs can find and recognize
                          your great work.
                        </p>
                        <Button
                          onClick={() => setActiveTab("profile")}
                          disabled={!isWalletConnected}
                          className="bg-primary text-primary-foreground hover:bg-primary/90 font-gaming"
                        >
                          {!isWalletConnected
                            ? "CONNECT WALLET FIRST"
                            : "CREATE PROFILE"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Badge variant="outline" className="font-gaming">
                          <Trophy className="mr-1 h-3 w-3" />
                          CREATOR REGISTERED
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          Profile active. VIPs can now recognize your
                          contributions.
                        </p>
                        <div className="bg-muted/50 p-2 border border-border text-xs">
                          <div className="flex items-center space-x-2">
                            <Hash className="h-3 w-3" />
                            <span>
                              Address: {currentCreatorProfile?.creatorAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ... existing stats cards ... */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Users className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-gaming text-2xl text-primary">
                          {creators.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          REGISTERED CREATORS
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Award className="h-8 w-8 text-secondary" />
                      <div>
                        <p className="font-gaming text-2xl text-secondary">
                          {creators.reduce((sum, c) => sum + c.recognitions, 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          TOTAL RECOGNITIONS
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-gaming text-2xl text-primary">
                          {
                            creators.filter((c) => c.isRecognizedThisWeek)
                              .length
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          THIS WEEK
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ... existing creators tab with enhanced VIP info ... */}
          {activeTab === "creators" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-gaming text-xl text-primary">
                  CREATOR DIRECTORY
                </h3>
                {isVIP && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="font-gaming text-xs">
                      VIP MODE: CAN RECOGNIZE
                    </Badge>
                    <Badge variant="outline" className="font-gaming text-xs">
                      {currentVIPProfile?.hasNominatedThisWeek
                        ? "NOMINATED THIS WEEK"
                        : "CAN NOMINATE"}
                    </Badge>
                  </div>
                )}
              </div>

              {isVIP && (
                <Card className="bg-secondary/10 border-secondary">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">
                      <Crown className="inline h-4 w-4 mr-1" />
                      As a VIP, you can browse creator profiles and recognize
                      outstanding work. Your identity stays encrypted for
                      privacy. You can nominate one creator per week.
                    </p>
                    {currentVIPProfile?.hasNominatedThisWeek && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ⚠️ You have already used your nomination for week{" "}
                        {currentWeek}. Come back next week!
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ... existing creator cards with enhanced info ... */}
              <CreatorsDirectory
                isVIP={true}
                currentWeek={currentWeek}
                currentVIPProfile={currentVIPProfile}
                onSelectCreator={setSelectedCreator}
              />

              {/* ... existing recognition form with enhanced privacy info ... */}
              {selectedCreator && (
                <RecognitionCard
                  selectedCreator={selectedCreator}
                  currentVIPProfile={currentVIPProfile}
                  currentWeek={currentWeek}
                  recognitionReason={recognitionReason}
                  setRecognitionReason={setRecognitionReason}
                  onSubmit={() => handleRecognizeCreator(selectedCreator)}
                  onCancel={() => setSelectedCreator(null)}
                />
              )}
            </div>
          )}

          {/* ... existing profile tab with enhanced form ... */}
          {activeTab === "profile" && (
            <CreatorProfile
              isCreator={isCreator}
              isWalletConnected={isWalletConnected}
              walletAddress={walletAddress}
              creatorForm={creatorForm}
              setIsCreator={setIsCreator}
              setCreatorForm={setCreatorForm}
              setCurrentCreatorProfile={setCurrentCreatorProfile} // Add this
              handleRegisterCreator={handleRegisterCreator}
              handleMintBadge={handleMintBadge}
              currentCreatorProfile={currentCreatorProfile}
              recognitions={recognitions}
              currentWeek={currentWeek}
            />
          )}

          {activeTab === "recognition" && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="font-gaming text-3xl text-primary">
                  MY RECOGNITION STATUS
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Check your pending recognitions and mint your NFT badges.
                  Track your weekly recognition progress.
                </p>
              </div>

              {!isCreator ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-8 text-center">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-gaming text-lg text-primary mb-2">
                      CREATOR PROFILE REQUIRED
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You need to register as a creator to receive recognition
                      and mint NFT badges.
                    </p>
                    <Button
                      onClick={() => setActiveTab("profile")}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 font-gaming"
                    >
                      CREATE PROFILE
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {/* Current Week Recognition Status */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="font-gaming text-primary flex items-center">
                        <Calendar className="mr-2 h-5 w-5" />
                        WEEK {currentWeek} STATUS
                      </CardTitle>
                      <CardDescription>
                        Your recognition status for the current week
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {currentCreatorProfile?.hasPendingBadge ? (
                        <div className="bg-secondary/10 border border-secondary p-4 space-y-4">
                          <div className="flex items-center space-x-3">
                            <Bell className="h-8 w-8 text-secondary animate-bounce" />
                            <div>
                              <p className="font-gaming text-lg text-secondary">
                                🎉 RECOGNITION RECEIVED!
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Congratulations! You've been recognized this
                                week by a VIP member.
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  VIP identity encrypted for privacy
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border">
                            <div>
                              <p className="font-gaming text-sm">
                                READY TO MINT NFT BADGE
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Click below to mint your recognition as an NFT
                                badge (gas fees apply)
                              </p>
                            </div>
                            <Button
                              onClick={() =>
                                handleMintBadge(currentCreatorProfile.id)
                              }
                              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-gaming"
                            >
                              <Gift className="mr-2 h-4 w-4" />
                              MINT NFT BADGE
                            </Button>
                          </div>
                        </div>
                      ) : currentCreatorProfile?.recognitionStatus ===
                        "claimed" ? (
                        <div className="bg-primary/10 border border-primary p-4">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-gaming text-lg text-primary">
                                NFT BADGE MINTED!
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Your recognition NFT has been successfully
                                minted for week {currentWeek}.
                              </p>
                              {recognitions.find(
                                (r) =>
                                  r.creatorId === currentCreatorProfile.id &&
                                  r.tokenId
                              )?.tokenId && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Hash className="h-4 w-4 text-primary" />
                                  <span className="text-sm text-primary font-gaming">
                                    TOKEN #
                                    {
                                      recognitions.find(
                                        (r) =>
                                          r.creatorId ===
                                            currentCreatorProfile.id &&
                                          r.tokenId
                                      )?.tokenId
                                    }
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-muted/50 border border-border p-4">
                          <div className="flex items-center space-x-3">
                            <Clock className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-gaming text-lg">
                                WAITING FOR RECOGNITION
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Your profile is live! VIPs are browsing creators
                                and recognizing good work.
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Think of it like waiting to be nominated for an
                                award.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recognition History */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="font-gaming text-primary flex items-center">
                        <Trophy className="mr-2 h-5 w-5" />
                        RECOGNITION HISTORY
                      </CardTitle>
                      <CardDescription>
                        Your past recognition NFT badges and achievements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {recognitions.filter(
                        (r) => r.creatorId === currentCreatorProfile?.id
                      ).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {recognitions
                            .filter(
                              (r) => r.creatorId === currentCreatorProfile?.id
                            )
                            .map((recognition) => (
                              <div
                                key={recognition.id}
                                className="bg-muted/30 border border-border p-4"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <Badge
                                    variant="outline"
                                    className="font-gaming text-xs"
                                  >
                                    WEEK {recognition.weekNumber}
                                  </Badge>
                                  {recognition.tokenId && (
                                    <Badge
                                      variant="default"
                                      className="font-gaming text-xs"
                                    >
                                      TOKEN #{recognition.tokenId}
                                    </Badge>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <p className="font-gaming text-sm text-primary">
                                    RECOGNITION CARD #
                                    {recognition.tokenId || "PENDING"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Weekly recognition for creator:{" "}
                                    {currentCreatorProfile?.name}
                                  </p>

                                  {recognition.encryptedReason && (
                                    <div className="bg-background/50 p-2 border border-border">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        Encrypted Recognition Reason:
                                      </p>
                                      <p className="font-mono text-xs text-primary break-all">
                                        {recognition.encryptedReason}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex items-center space-x-2 pt-2">
                                    <Shield className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">
                                      VIP identity protected
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="font-gaming text-sm text-muted-foreground">
                            NO RECOGNITION HISTORY YET
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Keep creating great content! VIPs will recognize
                            your work.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recognition Stats */}
                  <Card className="bg-card border-border">
                    <CardHeader>
                      <CardTitle className="font-gaming text-primary flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        RECOGNITION STATS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="font-gaming text-2xl text-primary">
                            {
                              recognitions.filter(
                                (r) => r.creatorId === currentCreatorProfile?.id
                              ).length
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            TOTAL RECOGNITIONS
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-gaming text-2xl text-secondary">
                            {
                              recognitions.filter(
                                (r) =>
                                  r.creatorId === currentCreatorProfile?.id &&
                                  r.tokenId
                              ).length
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            NFT BADGES MINTED
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-gaming text-2xl text-primary">
                            {currentWeek}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            CURRENT WEEK
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="font-gaming text-2xl text-muted-foreground">
                            {currentCreatorProfile?.hasPendingBadge ? "1" : "0"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PENDING BADGES
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
