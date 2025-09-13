import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Instagram, Grid, Layers, Hash, Gift } from "lucide-react";
import { Creator } from "@/lib/type";
import { useGetAllCreators } from "@/hooks/use-creator";

interface CreatorsDirectoryProps {
  isVIP?: boolean;
  currentWeek?: number;
  currentVIPProfile?: any;
  onSelectCreator?: (creator: Creator) => void;
}

const CreatorsDirectory: React.FC<CreatorsDirectoryProps> = ({
  isVIP = false,
  currentWeek = 1,
  currentVIPProfile,
  onSelectCreator = () => {},
}) => {
  const [isNFTMode, setIsNFTMode] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);

  // Blockchain data
  const { data: creatorsData, isLoading, error } = useGetAllCreators();

  // Process blockchain data
  useEffect(() => {
    if (creatorsData && Array.isArray(creatorsData)) {
      setCreators(creatorsData);
      console.log("creator profile:", creatorsData);
    }
  }, [creatorsData]);

  const toggleMode = () => {
    setIsNFTMode(!isNFTMode);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Error loading creators: {error.message}
        </p>
      </div>
    );
  }

  // NFT Card Component
  const NFTCreatorCard = ({ creator }: { creator: Creator }) => (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="relative  p-1 rounded-none shadow-2xl">
        <div className="bg-gradient-to-br from-yellow-400/20 via-yellow-400/20 to-black-400/20  p-2 backdrop-blur-sm">
          {/* Top right badges */}
          <div className="absolute z-50 top-4 right-4 flex gap-2">
            {creator.hasPendingBadge && (
              <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Gift className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-4 h-4 border-2 border-white rotate-45"></div>
            </div>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center text-center mt- mb-6">
            <div className="relative mb-4">
              <div className="w-full h-full bg-gradient-to-br from-white/30 to-white/10 rounded-none flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Avatar className="rounded-none  w-[300px] h-[200px] border-2 border-white/30">
                  <AvatarImage
                    src={creator?.profilePicture || "/placeholder.svg"}
                    className="rounded-xl"
                  />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-lg rounded-xl">
                    {creator?.name?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            <h2 className="text-xl font-bold text-justify text-white mb-1">
              {creator.name}
            </h2>
            <p className="text-pink-200 mb-4  text-center  text-sm">
              {creator.metadata}
            </p>

            {/* Recognition badges */}
            <div className="flex gap-2 mb-4 flex-wrap justify-center">
              <Badge className="bg-white/10 text-white border-white/20 text-xs">
                {creator.recognitionCount} RECOGNITIONS
              </Badge>
              {creator.isRecognizedThisWeek && (
                <Badge className="bg-green-500/30 text-white border-green-300/30 text-xs">
                  WEEK {currentWeek}
                </Badge>
              )}
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 mb-4 text-white/80 text-xs">
              <Hash className="h-3 w-3" />
              <span>{creator.creatorAddress}</span>
            </div>

            {/* Action button */}
            {isVIP && (
              <Button
                onClick={() => onSelectCreator(creator)}
                disabled={
                  currentVIPProfile?.hasNominatedThisWeek ||
                  creator.isRecognizedThisWeek
                }
                className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm text-xs font-bold disabled:opacity-50"
                variant="outline"
              >
                {currentVIPProfile?.hasNominatedThisWeek
                  ? "ALREADY NOMINATED"
                  : creator.isRecognizedThisWeek
                  ? "ALREADY RECOGNIZED"
                  : `RECOGNIZE ${creator?.name?.toUpperCase()}`}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10 transform scale-105"></div>
    </div>
  );

  // Grid Card Component
  const GridCreatorCard = ({ creator }: { creator: Creator }) => (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={creator?.profilePicture || "/placeholder.svg"} />
            <AvatarFallback className="bg-muted">
              {creator?.name?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-gaming text-sm">
              {creator.name}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {creator.recognitionCount} RECOGNITIONS
              </Badge>
              {creator.isRecognizedThisWeek && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  WEEK {currentWeek}
                </Badge>
              )}
              {creator.hasPendingBadge && (
                <Badge className="bg-secondary text-secondary-foreground text-xs">
                  <Gift className="h-3 w-3 mr-1" />
                  NFT
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{creator.metadata}</p>
        <div className="text-xs text-muted-foreground mb-4">
          <div className="flex items-center space-x-1">
            <Hash className="h-3 w-3" />
            <span>{creator.creatorAddress}</span>
          </div>
        </div>
        {isVIP && (
          <Button
            onClick={() => onSelectCreator(creator)}
            disabled={
              currentVIPProfile?.hasNominatedThisWeek ||
              creator.isRecognizedThisWeek
            }
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 font-gaming text-xs disabled:opacity-50"
          >
            {currentVIPProfile?.hasNominatedThisWeek
              ? "ALREADY NOMINATED"
              : creator.isRecognizedThisWeek
              ? "ALREADY RECOGNIZED"
              : `RECOGNIZE ${creator?.name?.toUpperCase()}`}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header with toggle */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            {creators.length} active creators •{" "}
            {isNFTMode ? "NFT Mode" : "Grid Mode"}
          </p>
        </div>
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          {isNFTMode ? <Grid size={16} /> : <Layers size={16} />}
          {isNFTMode ? "Switch to Grid" : "Switch to NFT"}
        </button>
      </div>

      {/* Content */}
      {isNFTMode ? (
        // NFT Mode - Single column on mobile, 2 on tablet, 3 on desktop
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {creators.map((creator) => (
            <NFTCreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      ) : (
        // Grid Mode - Original layout
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creators.map((creator) => (
            <GridCreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {creators.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No creators found</p>
        </div>
      )}
    </div>
  );
};

export default CreatorsDirectory;
