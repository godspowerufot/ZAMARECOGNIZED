export const FHEZamaVipABI = {
  address: "0x54CD4b0b53cCE73711Db188C663e4278a9Dd90b4",
  abi: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "vip",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "NominationMinted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "vip",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint32",
          name: "week",
          type: "uint32",
        },
      ],
      name: "NominationRecorded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "vip",
          type: "address",
        },
      ],
      name: "VIPRegistered",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "allNominations",
      outputs: [
        {
          internalType: "address",
          name: "creatorAddress",
          type: "address",
        },
        {
          internalType: "string",
          name: "creatorName",
          type: "string",
        },
        {
          internalType: "string",
          name: "reason",
          type: "string",
        },
        {
          internalType: "uint32",
          name: "weekNumber",
          type: "uint32",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isMinted",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "allVIPs",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "becomeVIPForTesting",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "checkVIPStatus",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllNominations",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "creatorAddress",
              type: "address",
            },
            {
              internalType: "string",
              name: "creatorName",
              type: "string",
            },
            {
              internalType: "string",
              name: "reason",
              type: "string",
            },
            {
              internalType: "uint32",
              name: "weekNumber",
              type: "uint32",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isMinted",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          internalType: "struct VIPRegistry.VIPNomination[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllVIPs",
      outputs: [
        {
          internalType: "address[]",
          name: "",
          type: "address[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vip",
          type: "address",
        },
      ],
      name: "getEncryptedVIPId",
      outputs: [
        {
          internalType: "euint32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_recipient",
          type: "address",
        },
      ],
      name: "getEncryptedVIPIdAndGrantAccess",
      outputs: [
        {
          internalType: "euint32",
          name: "",
          type: "bytes32",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getSystemNominationStats",
      outputs: [
        {
          internalType: "uint256",
          name: "totalNominations",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalMinted",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalPending",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getTotalVIPs",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vip",
          type: "address",
        },
      ],
      name: "getVIPNominations",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "creatorAddress",
              type: "address",
            },
            {
              internalType: "string",
              name: "creatorName",
              type: "string",
            },
            {
              internalType: "string",
              name: "reason",
              type: "string",
            },
            {
              internalType: "uint32",
              name: "weekNumber",
              type: "uint32",
            },
            {
              internalType: "uint256",
              name: "timestamp",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "isMinted",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "tokenId",
              type: "uint256",
            },
          ],
          internalType: "struct VIPRegistry.VIPNomination[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vip",
          type: "address",
        },
      ],
      name: "getVIPStats",
      outputs: [
        {
          internalType: "uint256",
          name: "totalNominations",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "mintedNominations",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "pendingNominations",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "_week",
          type: "uint32",
        },
      ],
      name: "getWeeklyStats",
      outputs: [
        {
          internalType: "address[]",
          name: "nominators",
          type: "address[]",
        },
        {
          internalType: "uint256",
          name: "nominationCount",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      name: "hasNominatedThisWeek",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vip",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "_week",
          type: "uint32",
        },
      ],
      name: "hasVIPNominatedThisWeek",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "isVIP",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vip",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "_week",
          type: "uint32",
        },
      ],
      name: "markNominated",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vip",
          type: "address",
        },
        {
          internalType: "address",
          name: "_creator",
          type: "address",
        },
        {
          internalType: "uint32",
          name: "_week",
          type: "uint32",
        },
        {
          internalType: "uint256",
          name: "_tokenId",
          type: "uint256",
        },
      ],
      name: "markNominationMinted",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "protocolId",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_vip",
          type: "address",
        },
        {
          internalType: "address",
          name: "_creator",
          type: "address",
        },
        {
          internalType: "string",
          name: "_creatorName",
          type: "string",
        },
        {
          internalType: "string",
          name: "_reason",
          type: "string",
        },
        {
          internalType: "uint32",
          name: "_week",
          type: "uint32",
        },
      ],
      name: "recordNomination",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "vipAddress",
          type: "address",
        },
        {
          internalType: "externalEuint32",
          name: "inputEuint32",
          type: "bytes32",
        },
        {
          internalType: "bytes",
          name: "inputProof",
          type: "bytes",
        },
      ],
      name: "registerVIP",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "vipMintedNominations",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "vipNominationHistory",
      outputs: [
        {
          internalType: "address",
          name: "creatorAddress",
          type: "address",
        },
        {
          internalType: "string",
          name: "creatorName",
          type: "string",
        },
        {
          internalType: "string",
          name: "reason",
          type: "string",
        },
        {
          internalType: "uint32",
          name: "weekNumber",
          type: "uint32",
        },
        {
          internalType: "uint256",
          name: "timestamp",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "isMinted",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "vipTotalNominations",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
      ],
      name: "weeklyNominationCount",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint32",
          name: "",
          type: "uint32",
        },
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "weeklyNominators",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
