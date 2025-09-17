// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CreatorRegistry {
    struct Creator {
        bool isActive;
        string name;
        string metadata;
        string profilePicture;
        uint32 recognitionCount;
    }

    // Extended struct for getAllCreators return that includes address
    struct CreatorWithAddress {
        address creatorAddress;
        bool isActive;
        string name;
        string metadata;
        string profilePicture;
        uint32 recognitionCount;
    }

    mapping(address => Creator) public creators;
    mapping(string => address) public nameToAddress;
    address[] public creatorsList;

    event CreatorRegistered(address indexed creator, string name);

    /**
     * @dev Register as a creator with profile data
     */
    function registerCreator(string memory _name, string memory _profilePicture, string memory _metadata) external {
        require(!creators[msg.sender].isActive, "Already registered as creator");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(nameToAddress[_name] == address(0), "Name already taken");

        creators[msg.sender] = Creator({
            isActive: true,
            name: _name,
            metadata: _metadata,
            profilePicture: _profilePicture,
            recognitionCount: 0
        });

        nameToAddress[_name] = msg.sender;
        creatorsList.push(msg.sender);

        emit CreatorRegistered(msg.sender, _name);
    }

    /**
     * @dev Get creator by name - returns ALL creator details including address and active status
     */
    function getCreatorByName(
        string memory _name
    )
        external
        view
        returns (
            address creatorAddress,
            bool isActive,
            string memory name,
            string memory metadata,
            string memory profilePicture,
            uint32 recognitionCount
        )
    {
        address addr = nameToAddress[_name];
        require(addr != address(0), "Creator not found");

        Creator memory creator = creators[addr];
        return (
            addr,
            creator.isActive,
            creator.name,
            creator.metadata,
            creator.profilePicture,
            creator.recognitionCount
        );
    }

    /**
     * @dev Get all creators with full data including addresses and active status
     */
    function getAllCreators() external view returns (CreatorWithAddress[] memory) {
        uint256 length = creatorsList.length;
        CreatorWithAddress[] memory allCreators = new CreatorWithAddress[](length);

        for (uint256 i = 0; i < length; i++) {
            address creatorAddr = creatorsList[i];
            Creator memory creator = creators[creatorAddr];

            allCreators[i] = CreatorWithAddress({
                creatorAddress: creatorAddr,
                isActive: creator.isActive,
                name: creator.name,
                metadata: creator.metadata,
                profilePicture: creator.profilePicture,
                recognitionCount: creator.recognitionCount
            });
        }

        return allCreators;
    }

    /**
     * @dev Get creator count
     */
    function getCreatorCount() external view returns (uint256) {
        return creatorsList.length;
    }

    /**
     * @dev Increment recognition count (only callable by main contract)
     */
    function incrementRecognitionCount(address _creator) external {
        require(creators[_creator].isActive, "Creator not found");
        creators[_creator].recognitionCount++;
    }

    /**
     * @dev Check if creator is active
     */
    function isActiveCreator(address _creator) external view returns (bool) {
        return creators[_creator].isActive;
    }

    /**
     * @dev Get creator name by address
     */
    function getCreatorName(address _creator) external view returns (string memory) {
        require(creators[_creator].isActive, "Creator not found");
        return creators[_creator].name;
    }

    /**
     * @dev Get full creator details by address - returns ALL creator information
     */
    function getCreatorByAddress(
        address _creator
    )
        external
        view
        returns (
            address creatorAddress,
            bool isActive,
            string memory name,
            string memory metadata,
            string memory profilePicture,
            uint32 recognitionCount
        )
    {
        require(creators[_creator].isActive, "Creator not found");

        Creator memory creator = creators[_creator];
        return (
            _creator,
            creator.isActive,
            creator.name,
            creator.metadata,
            creator.profilePicture,
            creator.recognitionCount
        );
    }
}
