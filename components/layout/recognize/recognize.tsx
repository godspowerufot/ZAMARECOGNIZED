"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Shield, Calendar } from "lucide-react";
import { Creator, VIP } from "@/lib/type";

interface RecognitionCardProps {
  selectedCreator: Creator;
  currentVIPProfile: VIP | null;
  currentWeek: number;
  recognitionReason: string;
  isSubmitting?: boolean;
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  setRecognitionReason: (value: string) => void;
  onSubmit: (creator: Creator) => void;
  onCancel: () => void;
}

export default function RecognitionCard({
  selectedCreator,
  currentVIPProfile,
  currentWeek,
  recognitionReason,
  setRecognitionReason,
  onSubmit,
  isSubmitting,
  isPending,
  isConfirming,
  isSuccess,
  onCancel,
}: RecognitionCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-gaming text-primary">
          RECOGNIZE {selectedCreator.name.toUpperCase()}
        </CardTitle>
        <CardDescription>
          Give recognition for outstanding work. The creator will be notified
          but your identity stays encrypted for privacy protection.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info box */}
        <div className="bg-muted/50 p-3 border border-border text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <Shield className="h-3 w-3" />
            <span>
              Your VIP ID will be encrypted:{" "}
              {currentVIPProfile?.encryptedId?.slice(0, 12)}...
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3" />
            <span>Recognition for week {currentWeek}</span>
          </div>
        </div>

        {/* Reason */}
        <Textarea
          placeholder="Write a reason for recognition (will be encrypted): 'Great educational content this week!'"
          value={recognitionReason}
          onChange={(e) => setRecognitionReason(e.target.value)}
          className="bg-input border-border"
        />

        {/* Actions */}
        <div className="flex space-x-2">
          <Button
            onClick={() => onSubmit(selectedCreator)}
            disabled={isSubmitting || isPending || isConfirming}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-gaming"
          >
            {isPending
              ? "PREPARING TRANSACTION..."
              : isConfirming
              ? "CONFIRMING RECOGNITION..."
              : isSubmitting
              ? "ENCRYPTING RECOGNITION..."
              : isSuccess
              ? "RECOGNITION SUBMITTED!"
              : "SUBMIT RECOGNITION"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isPending || isConfirming}
            className="font-gaming"
          >
            CANCEL
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
