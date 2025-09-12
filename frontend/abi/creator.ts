export const FHEZamaCreatorABI = {
  abi: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "creator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
      ],
      name: "CreatorRegistered",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "creators",
      outputs: [
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadata",
          type: "string",
        },
        {
          internalType: "string",
          name: "profilePicture",
          type: "string",
        },
        {
          internalType: "uint32",
          name: "recognitionCount",
          type: "uint32",
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
      name: "creatorsList",
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
      name: "getAllCreators",
      outputs: [
        {
          components: [
            {
              internalType: "address",
              name: "creatorAddress",
              type: "address",
            },
            {
              internalType: "bool",
              name: "isActive",
              type: "bool",
            },
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "string",
              name: "metadata",
              type: "string",
            },
            {
              internalType: "string",
              name: "profilePicture",
              type: "string",
            },
            {
              internalType: "uint32",
              name: "recognitionCount",
              type: "uint32",
            },
          ],
          internalType: "struct CreatorRegistry.CreatorWithAddress[]",
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
          name: "_creator",
          type: "address",
        },
      ],
      name: "getCreatorByAddress",
      outputs: [
        {
          internalType: "address",
          name: "creatorAddress",
          type: "address",
        },
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadata",
          type: "string",
        },
        {
          internalType: "string",
          name: "profilePicture",
          type: "string",
        },
        {
          internalType: "uint32",
          name: "recognitionCount",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_name",
          type: "string",
        },
      ],
      name: "getCreatorByName",
      outputs: [
        {
          internalType: "address",
          name: "creatorAddress",
          type: "address",
        },
        {
          internalType: "bool",
          name: "isActive",
          type: "bool",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "metadata",
          type: "string",
        },
        {
          internalType: "string",
          name: "profilePicture",
          type: "string",
        },
        {
          internalType: "uint32",
          name: "recognitionCount",
          type: "uint32",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getCreatorCount",
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
          name: "_creator",
          type: "address",
        },
      ],
      name: "getCreatorName",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_creator",
          type: "address",
        },
      ],
      name: "incrementRecognitionCount",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_creator",
          type: "address",
        },
      ],
      name: "isActiveCreator",
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
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      name: "nameToAddress",
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
      inputs: [
        {
          internalType: "string",
          name: "_name",
          type: "string",
        },
        {
          internalType: "string",
          name: "_profilePicture",
          type: "string",
        },
        {
          internalType: "string",
          name: "_metadata",
          type: "string",
        },
      ],
      name: "registerCreator",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
