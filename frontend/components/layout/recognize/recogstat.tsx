import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Address } from "viem";
import { useCreatorRecognitionSummary } from "@/hooks/use-recognize";
import { Creator } from "@/lib/type";

interface RecognitionStatsProps {
  currentCreatorProfile: Creator | null;
  currentWeek: number;
  pendingRecognitionsCount?: number;
  isLoading?: boolean;
}

const RecognitionStats: React.FC<RecognitionStatsProps> = ({
  currentCreatorProfile,
  currentWeek,
  pendingRecognitionsCount = 0,
  isLoading = false,
}) => {
  // Fetch creator recognition summary from smart contract
  const { data: creatorStats } = useCreatorRecognitionSummary(
    currentCreatorProfile?.creatorAddress as Address
  );

  // Parse the recognition summary data
  const parsedStats = React.useMemo(() => {
    if (!creatorStats || !Array.isArray(creatorStats)) {
      return {
        totalRecognitions: 0,
        mintedBadges: 0,
        pendingBadges: 0,
        weeklyRecognitions: 0,
      };
    }

    // Assuming creatorStats returns [totalRecognitions, mintedBadges, pendingBadges, weeklyRecognitions]
    const [total, minted, pending, weekly] = creatorStats;

    return {
      totalRecognitions: Number(total) || 0,
      mintedBadges: Number(minted) || 0,
      pendingBadges: Number(pending) || 0,
      weeklyRecognitions: Number(weekly) || 0,
    };
  }, [creatorStats]);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-gaming text-primary flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            RECOGNITION STATS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="text-center animate-pulse">
                <div className="h-8 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted/50 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-gaming text-primary flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          RECOGNITION STATS
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            value={parsedStats.totalRecognitions}
            label="TOTAL RECOGNITIONS"
            variant="primary"
          />
          <StatCard
            value={parsedStats.mintedBadges}
            label="NFT BADGES MINTED"
            variant="secondary"
          />
          <StatCard
            value={currentWeek}
            label="CURRENT WEEK"
            variant="primary"
          />
          <StatCard
            value={parsedStats.pendingBadges || pendingRecognitionsCount}
            label="PENDING BADGES"
            variant="muted"
          />
        </div>
      </CardContent>
    </Card>
  );
};

// Sub-component for individual stat cards
const StatCard: React.FC<{
  value: number | string;
  label: string;
  variant: "primary" | "secondary" | "muted";
}> = ({ value, label, variant }) => {
  const getTextColor = (variant: string) => {
    switch (variant) {
      case "primary":
        return "text-primary";
      case "secondary":
        return "text-secondary";
      case "muted":
        return "text-muted-foreground";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="text-center">
      <p className={`font-gaming text-2xl ${getTextColor(variant)}`}>{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

export default RecognitionStats;
