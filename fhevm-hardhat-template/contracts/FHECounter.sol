// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ZamaCreatorsRecognition is ERC721, Ownable, SepoliaConfig {
    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    uint256 private _tokenIdCounter;

    // VIP Management
    mapping(address => bool) public isVIP;
    mapping(address => euint32) private encryptedVIPIds; // Private VIP identifiers

    // Recognition System - creators mint their own cards when recognized
    mapping(address => mapping(uint32 => bool)) public creatorRecognizedThisWeek;
    mapping(address => mapping(uint32 => bool)) public hasNominatedThisWeek;
    mapping(address => mapping(uint32 => Recognition)) public pendingRecognitions;

    // Creator Management
    struct Creator {
        bool isActive;
        string name; // X/Twitter handle or display name
        string metadata; // JSON metadata (bio, links, etc.)
        string profilePicture; // IPFS hash or URL
        uint32 recognitionCount;
    }

    mapping(address => Creator) public creators;
    mapping(string => address) public nameToAddress; // Map creator name to address
    address[] public creatorsList;

    // Recognition Cards
    struct Recognition {
        address creator;
        euint32 encryptedVIPId; // Who nominated (encrypted)
        bytes encryptedReason; // Why nominated (encrypted)
        uint32 weekNumber; // When nominated
        string creatorName; // Creator's name for easy reference
    }

    mapping(uint256 => Recognition) public recognitions;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event VIPRegistered(address indexed vip);
    event CreatorRegistered(address indexed creator, string name);
    event CreatorRecognized(address indexed creator, uint256 tokenId, uint32 week, string creatorName);

    // =============================================================================
    // MODIFIERS
    // =============================================================================

    modifier onlyVIP() {
        require(isVIP[msg.sender], "Not a registered VIP");
        _;
    }

    modifier onlyRegisteredCreator(address _creator) {
        require(creators[_creator].isActive, "Not a registered creator");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor() ERC721("Zama Creators Recognition", "ZCR") Ownable(msg.sender) {
        _tokenIdCounter = 1;
    }

    // =============================================================================
    // VIP MANAGEMENT
    // =============================================================================

    /**
     * @dev Register a new VIP (only owner can do this - acts as whitelist)
     * @param _vip Address to register as VIP
     * @param inputEuint32 Encrypted VIP identifier
     * @param inputProof Input proof for encrypted data
     */
    function registerVIP(address _vip, externalEuint32 inputEuint32, bytes calldata inputProof) external onlyOwner {
        require(!isVIP[_vip], "Already a VIP");

        euint32 encryptedId = FHE.fromExternal(inputEuint32, inputProof);

        isVIP[_vip] = true;
        encryptedVIPIds[_vip] = encryptedId;

        // Allow contract and VIP to access their encrypted ID
        FHE.allowThis(encryptedId);
        FHE.allow(encryptedId, _vip);

        emit VIPRegistered(_vip);
    }

    /**
     * @dev Simple VIP access for testing - anyone can become VIP with test credentials
     */
    function becomeVIPForTesting() external {
        require(!isVIP[msg.sender], "Already a VIP");

        // Create a simple encrypted ID from address for testing
        euint32 testId = FHE.asEuint32(uint32(uint160(msg.sender)));

        isVIP[msg.sender] = true;
        encryptedVIPIds[msg.sender] = testId;

        // Allow contract and user to access the encrypted ID
        FHE.allowThis(testId);
        FHE.allow(testId, msg.sender);

        emit VIPRegistered(msg.sender);
    }

    /**
     * @dev Check if address is VIP
     */
    function checkVIPStatus(address _address) external view returns (bool) {
        return isVIP[_address];
    }

    // =============================================================================
    // CREATOR MANAGEMENT
    // =============================================================================

    /**
     * @dev Register as a creator with profile data
     * @param _name Creator's name/handle (must be unique)
     * @param _metadata JSON metadata (bio, social links, etc.)
     * @param _profilePicture IPFS hash or URL for profile picture
     */
    function registerCreator(string memory _name, string memory _metadata, string memory _profilePicture) external {
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
     * @dev Get creator by name
     */
    function getCreatorByName(
        string memory _name
    )
        external
        view
        returns (
            address creatorAddress,
            string memory name,
            string memory metadata,
            string memory profilePicture,
            uint32 recognitionCount
        )
    {
        address addr = nameToAddress[_name];
        require(addr != address(0), "Creator not found");

        Creator memory creator = creators[addr];
        return (addr, creator.name, creator.metadata, creator.profilePicture, creator.recognitionCount);
    }

    /**
     * @dev Get all creators
     */
    function getAllCreators() external view returns (address[] memory) {
        return creatorsList;
    }

    /**
     * @dev Get creator count
     */
    function getCreatorCount() external view returns (uint256) {
        return creatorsList.length;
    }

    // =============================================================================
    // RECOGNITION SYSTEM
    // =============================================================================

    /**
     * @dev VIP recognizes a creator (creates pending recognition)
     * @param _creatorName Creator's name (empty string if using address)
     * @param _creatorAddress Creator's address (zero address if using name)
     * @param _encryptedReason Encrypted reason for recognition (client-side encrypted)
     * @param _weekNumber Current week number
     */
    function recognizeCreator(
        string memory _creatorName,
        address _creatorAddress,
        bytes memory _encryptedReason,
        uint32 _weekNumber
    ) external onlyVIP {
        require(!hasNominatedThisWeek[msg.sender][_weekNumber], "Already nominated this week");

        address targetCreator;
        string memory finalName;

        // Determine target creator
        if (bytes(_creatorName).length > 0) {
            // Recognize by name
            targetCreator = nameToAddress[_creatorName];
            require(targetCreator != address(0), "Creator name not found");
            finalName = _creatorName;
        } else {
            // Recognize by address
            require(_creatorAddress != address(0), "Must provide creator name or address");
            require(creators[_creatorAddress].isActive, "Creator not registered");
            targetCreator = _creatorAddress;
            finalName = creators[_creatorAddress].name;
        }

        require(!creatorRecognizedThisWeek[targetCreator][_weekNumber], "Creator already recognized this week");

        // Get VIP's encrypted ID
        euint32 vipId = encryptedVIPIds[msg.sender];

        // Create pending recognition (creator will mint later)
        pendingRecognitions[targetCreator][_weekNumber] = Recognition({
            creator: targetCreator,
            encryptedVIPId: vipId,
            encryptedReason: _encryptedReason,
            weekNumber: _weekNumber,
            creatorName: finalName
        });

        // Allow creator to access the encrypted VIP ID for their recognition
        FHE.allow(vipId, targetCreator);

        // Update state
        creatorRecognizedThisWeek[targetCreator][_weekNumber] = true;
        hasNominatedThisWeek[msg.sender][_weekNumber] = true;

        emit CreatorRecognized(targetCreator, 0, _weekNumber, finalName); // tokenId = 0 since not minted yet
    }

    /**
     * @dev Creator mints their recognition card
     * @param _weekNumber Week number they were recognized
     */
    function mintMyRecognitionCard(uint32 _weekNumber) external {
        require(creators[msg.sender].isActive, "Not a registered creator");
        require(creatorRecognizedThisWeek[msg.sender][_weekNumber], "Not recognized this week");

        Recognition memory pending = pendingRecognitions[msg.sender][_weekNumber];
        require(pending.creator == msg.sender, "No pending recognition");

        // Mint the NFT
        uint256 tokenId = _tokenIdCounter++;
        _mint(msg.sender, tokenId);

        // Store recognition data
        recognitions[tokenId] = pending;

        // Update recognition count
        creators[msg.sender].recognitionCount++;

        // Clear pending recognition
        delete pendingRecognitions[msg.sender][_weekNumber];

        emit CreatorRecognized(msg.sender, tokenId, _weekNumber, pending.creatorName);
    }

    /**
     * @dev Get current week number (simple implementation)
     */
    function getCurrentWeek() external view returns (uint32) {
        return uint32(block.timestamp / 1 weeks);
    }

    /**
     * @dev Check if creator has pending recognition to mint
     */
    function hasPendingRecognition(address _creator, uint32 _weekNumber) external view returns (bool) {
        return
            creatorRecognizedThisWeek[_creator][_weekNumber] &&
            pendingRecognitions[_creator][_weekNumber].creator == _creator;
    }

    // =============================================================================
    // NFT METADATA
    // =============================================================================

    /**
     * @dev Get token URI for recognition card
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        Recognition memory recognition = recognitions[tokenId];
        Creator memory creator = creators[recognition.creator];

        // Build JSON metadata (only public info)
        return
            string(
                abi.encodePacked(
                    '{"name": "Recognition Card #',
                    _toString(tokenId),
                    '", "description": "Weekly recognition for creator: ',
                    creator.name,
                    '", "image": "https://your-api.com/generate-badge/',
                    _toString(tokenId),
                    '", "attributes": [',
                    '{"trait_type": "Creator", "value": "',
                    creator.name,
                    '"},',
                    '{"trait_type": "Week", "value": "',
                    _toString(recognition.weekNumber),
                    '"},',
                    '{"trait_type": "Recognition Count", "value": "',
                    _toString(creator.recognitionCount),
                    '"}',
                    "]}"
                )
            );
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * @dev Convert uint to string
     */
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /**
     * @dev Get total supply of recognition cards
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    // =============================================================================
    // PRIVACY FUNCTIONS (for creator to decrypt their data)
    // =============================================================================

    /**
     * @dev Allow creator to decrypt their recognition reason (if they have the key)
     * This would integrate with fhEVM's decryption capabilities
     */
    function getMyRecognitionDetails(
        uint256 tokenId
    ) external view returns (bytes memory encryptedReason, uint32 weekNumber, string memory creatorName) {
        require(_ownerOf(tokenId) == msg.sender, "Not your recognition card");

        Recognition memory recognition = recognitions[tokenId];
        return (recognition.encryptedReason, recognition.weekNumber, recognition.creatorName);
    }
}
