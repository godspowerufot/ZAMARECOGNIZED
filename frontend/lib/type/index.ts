export interface Creator {
  recognitionCount: number;
  id: string;
  name: string;
  avatar: string;
  recognitions: number;
  isRecognizedThisWeek: boolean;
  hasPendingBadge: boolean;
  recognitionStatus: "waiting" | "recognized" | "claimed";
  lastRecognitionWeek?: string;
  creatorAddress?: string;
  metadata?: string;
  profilePicture?: string;
  isActive: boolean;
}
export interface VIP {
  id: string;
  name: string;
  isConnected: boolean;
  address?: string;
  encryptedId?: string;
  hasNominatedThisWeek: boolean;
}

export interface Recognition {
  id?: string;
  creatorId: string;
  reason: string;
  week: string;
  creatorAddress: string;
  timestamp: number;
  vipId?: string;
  encryptedReason?: string;
  weekNumber: number;
  creatorName: string;
  tokenId?: number;
}

// Type for the contract response array
type ContractCreatorResponse = readonly [
  string, // address
  boolean, // isActive
  string, // name
  string, // metadata
  string, // profilePicture
  bigint // recognitionCount
];

/**
 * Maps contract response array to Creator interface
 */
export function mapContractResponseToCreator(
  contractResponse: ContractCreatorResponse,
  options?: {
    isRecognizedThisWeek?: boolean;
    hasPendingBadge?: boolean;
    recognitionStatus?: "waiting" | "recognized" | "claimed";
    lastRecognitionWeek?: string;
  }
): Creator {
  const [address, isActive, name, metadata, profilePicture, recognitionCount] =
    contractResponse;

  return {
    // Contract data

    creatorAddress: address,
    isActive: isActive,
    name: name,
    metadata: metadata,
    profilePicture: profilePicture,
    recognitionCount: Number(recognitionCount),

    // Mapped/derived fields
    id: address, // Using address as unique ID
    avatar: profilePicture, // Using profilePicture as avatar
    recognitions: Number(recognitionCount), // Same as recognitionCount

    // Optional fields with defaults
    isRecognizedThisWeek: options?.isRecognizedThisWeek ?? false,
    hasPendingBadge: options?.hasPendingBadge ?? false,
    recognitionStatus: options?.recognitionStatus ?? "waiting",
    lastRecognitionWeek: options?.lastRecognitionWeek,
  };
}

/**
 * Maps multiple contract responses to Creator array
 */
export function mapContractResponsesToCreators(
  contractResponses: ContractCreatorResponse[],
  optionsArray?: Array<{
    isRecognizedThisWeek?: boolean;
    hasPendingBadge?: boolean;
    recognitionStatus?: "waiting" | "recognized" | "claimed";
    lastRecognitionWeek?: string;
  }>
): Creator[] {
  return contractResponses.map((response, index) =>
    mapContractResponseToCreator(response, optionsArray?.[index])
  );
}

/**
 * Example usage with your specific data
 */
