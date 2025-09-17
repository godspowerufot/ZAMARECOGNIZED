import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Shield, CheckCircle, Clock } from "lucide-react";
import { Creator } from "@/lib/type";

interface Recognition {
  id?: string;
  weekNumber?: number | string;
  tokenId?: string | number;
  reason?: string;
  encryptedReason?: string;
  creatorId?: string;
  creatorName?: string;
  timestamp?: number;
  vipAddress?: string;
}

interface RecognitionHistoryProps {
  creatorRecognitions: Recognition[] | any;
  creatorMintedRecognitions?: Recognition[] | any; // NEW: Add minted recognitions prop
  currentCreatorProfile: Creator | null;
  isLoading?: boolean;
  isMintedLoading?: boolean; // NEW: Add loading state for minted recognitions
}

const RecognitionHistory: React.FC<RecognitionHistoryProps> = ({
  creatorRecognitions,
  creatorMintedRecognitions,
  currentCreatorProfile,
  isLoading = false,
  isMintedLoading = false,
}) => {
  // Safely handle the data from the hooks
  const safeCreatorRecognitions = Array.isArray(creatorRecognitions)
    ? creatorRecognitions
    : [];

  const safeMintedRecognitions = Array.isArray(creatorMintedRecognitions)
    ? creatorMintedRecognitions
    : [];

  if (isLoading || isMintedLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-gaming text-primary flex items-center">
            <Trophy className="mr-2 h-5 w-5" />
            RECOGNITION HISTORY
          </CardTitle>
          <CardDescription>
            Your recognition NFT badges and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-gaming text-sm text-muted-foreground">
                LOADING RECOGNITION HISTORY...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Minted Recognitions Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-gaming text-primary flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            MINTED RECOGNITION CARDS
          </CardTitle>
          <CardDescription>
            Your collected recognition NFT badges that have been minted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {safeMintedRecognitions.length > 0 ? (
            <>
              <div className="mb-4">
                <Badge variant="default" className="font-gaming text-xs">
                  {safeMintedRecognitions.length} MINTED CARDS
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeMintedRecognitions.map((recognition, index) => (
                  <MintedRecognitionCard
                    key={recognition.tokenId || `minted-${index}`}
                    recognition={recognition}
                    creatorName={currentCreatorProfile?.name}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyMintedState />
          )}
        </CardContent>
      </Card>

      {/* Existing Recognition History Section */}
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
          {safeCreatorRecognitions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeCreatorRecognitions.map((recognition, index) => (
                <RecognitionCard
                  key={recognition.id || `recognition-${index}`}
                  recognition={recognition}
                  creatorName={currentCreatorProfile?.name}
                />
              ))}
            </div>
          ) : (
            <EmptyRecognitionState />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Sub-component for minted recognition cards
const MintedRecognitionCard: React.FC<{
  recognition: Recognition;
  creatorName?: string;
}> = ({ recognition, creatorName }) => {
  return (
    <div className="bg-gradient-to-br from-green-900/20 to-emerald-800/20 border border-green-500/30 p-4 rounded-lg relative overflow-hidden">
      {/* Minted Badge */}
      <div className="absolute top-2 right-2">
        <Badge
          variant="default"
          className="bg-green-600 text-white font-gaming text-xs"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          MINTED
        </Badge>
      </div>

      <div className="flex items-center justify-between mb-3 pr-20">
        <Badge
          variant="outline"
          className="font-gaming text-xs border-green-500/50"
        >
          WEEK {recognition.weekNumber?.toString() || "Unknown"}
        </Badge>
        {recognition.tokenId && (
          <Badge
            variant="secondary"
            className="font-gaming text-xs bg-green-700/30"
          >
            TOKEN #{recognition.tokenId}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-gaming text-sm text-green-400">
          RECOGNITION CARD {recognition.tokenId}
        </p>
        <p className="text-xs text-muted-foreground">
          Weekly recognition for creator: {creatorName || "Unknown"}
        </p>

        {recognition.reason && (
          <div className="bg-background/50 p-2 border border-green-500/30 rounded">
            <p className="text-xs text-muted-foreground mb-1">
              Recognition Reason:
            </p>
            <p className="text-xs text-green-300 break-words">
              {recognition.reason}
            </p>
          </div>
        )}

        {recognition.timestamp && (
          <div className="bg-background/30 p-2 border border-green-500/20 rounded">
            <p className="text-xs text-muted-foreground mb-1">Minted On:</p>
            <p className="text-xs text-green-400">
              {new Date(
                Number(recognition.timestamp) * 1000
              ).toLocaleDateString()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-400">NFT Minted & Secured</span>
          </div>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </div>
      </div>
    </div>
  );
};

// Sub-component for pending recognition cards
const PendingRecognitionCard: React.FC<{
  recognition: Recognition;
  creatorName?: string;
}> = ({ recognition, creatorName }) => {
  return (
    <div className="bg-gradient-to-br from-yellow-900/20 to-orange-800/20 border border-yellow-500/30 p-4 rounded-lg relative overflow-hidden">
      {/* Pending Badge */}
      <div className="absolute top-2 right-2">
        <Badge
          variant="outline"
          className="border-yellow-500 text-yellow-400 font-gaming text-xs"
        >
          <Clock className="h-3 w-3 mr-1" />
          PENDING
        </Badge>
      </div>

      <div className="flex items-center justify-between mb-3 pr-20">
        <Badge
          variant="outline"
          className="font-gaming text-xs border-yellow-500/50"
        >
          WEEK {recognition.weekNumber?.toString() || "Unknown"}
        </Badge>
      </div>

      <div className="space-y-2">
        <p className="font-gaming text-sm text-yellow-400">
          RECOGNITION NOMINATION
        </p>
        <p className="text-xs text-muted-foreground">
          Weekly recognition for creator: {creatorName || "Unknown"}
        </p>

        {recognition.reason && (
          <div className="bg-background/50 p-2 border border-yellow-500/30 rounded">
            <p className="text-xs text-muted-foreground mb-1">
              Recognition Reason:
            </p>
            <p className="text-xs text-yellow-300 break-words">
              {recognition.reason}
            </p>
          </div>
        )}

        {recognition.encryptedReason && (
          <div className="bg-background/50 p-2 border border-yellow-500/20 rounded">
            <p className="text-xs text-muted-foreground mb-1">
              Encrypted Recognition Reason:
            </p>
            <p className="font-mono text-xs text-yellow-400 break-all">
              {recognition.encryptedReason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-yellow-400">
              VIP identity protected
            </span>
          </div>
          <div className="text-xs text-yellow-500 font-gaming">
            READY TO MINT
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual recognition cards
const RecognitionCard: React.FC<{
  recognition: Recognition;
  creatorName?: string;
}> = ({ recognition, creatorName }) => {
  return (
    <div className="bg-muted/30 border border-border p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <Badge variant="outline" className="font-gaming text-xs">
          WEEK {recognition.weekNumber?.toString() || "Unknown"}
        </Badge>
        {recognition.tokenId && (
          <Badge variant="default" className="font-gaming text-xs">
            TOKEN #{recognition.tokenId}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-gaming text-sm text-primary">
          RECOGNITION CARD {recognition.tokenId}
        </p>
        <p className="text-xs text-muted-foreground">
          Weekly recognition for creator: {creatorName || "Unknown"}
        </p>

        {recognition.reason && (
          <div className="bg-background/50 p-2 border border-border rounded">
            <p className="text-xs text-muted-foreground mb-1">
              Recognition Reason:
            </p>
            <p className="text-xs text-primary break-words">
              {recognition.reason}
            </p>
          </div>
        )}

        {recognition.encryptedReason && (
          <div className="bg-background/50 p-2 border border-border rounded">
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
  );
};
// Sub-component for empty minted state
const EmptyMintedState: React.FC = () => {
  return (
    <div className="text-center py-6">
      <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="font-gaming text-sm text-muted-foreground">
        NO MINTED RECOGNITION CARDS YET
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Mint your pending recognitions to collect your NFT badges.
      </p>
    </div>
  );
};

// Sub-component for empty pending state
const EmptyPendingState: React.FC = () => {
  return (
    <div className="text-center py-6">
      <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
      <p className="font-gaming text-sm text-muted-foreground">
        NO PENDING RECOGNITIONS
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Keep creating great content! VIPs will recognize your work.
      </p>
    </div>
  );
};

// Sub-component for empty state when no recognitions exist at all
const EmptyRecognitionState: React.FC = () => {
  return (
    <Card className="bg-card border-border">
      <CardContent>
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <p className="font-gaming text-lg text-muted-foreground mb-2">
            NO RECOGNITION HISTORY YET
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Keep creating amazing content! When VIPs recognize your work, you'll
            see both pending nominations and your minted NFT badges here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecognitionHistory;
