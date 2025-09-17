// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, euint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

// Import our modular contracts
import "./Vipregistry.sol";
import "./creator.sol";

contract ZamaRecognitionMain is ERC721, Ownable, SepoliaConfig {
    uint256 private _tokenIdCounter;

    // Contract references
    VIPRegistry public vipRegistry;
    CreatorRegistry public creatorRegistry;

    // Recognition System
    struct Recognition {
        address creator;
        euint32 encryptedVIPId;
        string reason;
        uint32 weekNumber;
        string creatorName;
        address vipAddress; // NEW: Track which VIP made the nomination
        uint256 timestamp; // NEW: Track when recognition was created
    }

    // NEW: Comprehensive tracking structures
    struct CreatorRecognitionSummary {
        uint256 totalRecognitions;
        uint256 mintedRecognitions;
        uint256 pendingRecognitions;
        uint256[] tokenIds;
    }

    struct WeeklyRecognitionData {
        address[] recognizedCreators;
        address[] nominatingVIPs;
        uint256 totalRecognitions;
        uint256 mintedCount;
    }

    // Existing mappings
    mapping(uint256 => Recognition) public recognitions;
    mapping(address => mapping(uint32 => bool)) public creatorRecognizedThisWeek;
    mapping(address => mapping(uint32 => Recognition)) public pendingRecognitions;

    // NEW: Enhanced tracking mappings
    mapping(address => uint256[]) public creatorTokenIds;
    mapping(address => Recognition[]) public creatorRecognitionHistory;
    mapping(uint32 => WeeklyRecognitionData) public weeklyData;
    mapping(address => mapping(uint32 => Recognition)) public creatorWeeklyRecognitions;

    // Global tracking
    uint256 public totalPendingRecognitions;
    uint256 public totalMintedRecognitions;

    event CreatorRecognized(address indexed creator, uint256 tokenId, uint32 week, string creatorName, string reason);
    event RecognitionPending(address indexed vip, address indexed creator, uint32 week, string reason);

    modifier onlyVIP() {
        require(vipRegistry.checkVIPStatus(msg.sender), "Not a registered VIP");
        _;
    }

    constructor(
        address _vipRegistry,
        address _creatorRegistry
    ) ERC721("Zama Creators Recognition", "ZCR") Ownable(msg.sender) {
        _tokenIdCounter = 1;
        vipRegistry = VIPRegistry(_vipRegistry);
        creatorRegistry = CreatorRegistry(_creatorRegistry);
    }

    /**
     * @dev VIP recognizes a creator (creates pending recognition)
     */
    function recognizeCreator(
        string memory _creatorName,
        address _creatorAddress,
        string memory _reason,
        uint32 _weekNumber
    ) external onlyVIP {
        require(!vipRegistry.hasVIPNominatedThisWeek(msg.sender, _weekNumber), "Already nominated this week");

        address targetCreator;
        string memory finalName;

        // Determine target creator
        if (bytes(_creatorName).length > 0) {
            targetCreator = creatorRegistry.nameToAddress(_creatorName);
            require(targetCreator != address(0), "Creator name not found");
            finalName = _creatorName;
        } else {
            require(_creatorAddress != address(0), "Must provide creator name or address");
            require(creatorRegistry.isActiveCreator(_creatorAddress), "Creator not registered");
            targetCreator = _creatorAddress;
            finalName = creatorRegistry.getCreatorName(_creatorAddress);
        }

        require(!creatorRecognizedThisWeek[targetCreator][_weekNumber], "Creator already recognized this week");

        euint32 dummyVipId = FHE.asEuint32(0);

        // Create pending recognition with enhanced data
        Recognition memory newRecognition = Recognition({
            creator: targetCreator,
            encryptedVIPId: dummyVipId,
            reason: _reason,
            weekNumber: _weekNumber,
            creatorName: finalName,
            vipAddress: msg.sender,
            timestamp: block.timestamp
        });

        // Store pending recognition
        pendingRecognitions[targetCreator][_weekNumber] = newRecognition;
        creatorWeeklyRecognitions[targetCreator][_weekNumber] = newRecognition;

        // NEW: Update tracking data
        creatorRecognitionHistory[targetCreator].push(newRecognition);
        weeklyData[_weekNumber].recognizedCreators.push(targetCreator);
        weeklyData[_weekNumber].nominatingVIPs.push(msg.sender);
        weeklyData[_weekNumber].totalRecognitions++;
        totalPendingRecognitions++;

        // Update state
        creatorRecognizedThisWeek[targetCreator][_weekNumber] = true;
        vipRegistry.markNominated(msg.sender, _weekNumber);

        // NEW: Record nomination in VIP registry
        vipRegistry.recordNomination(msg.sender, targetCreator, finalName, _reason, _weekNumber);

        emit RecognitionPending(msg.sender, targetCreator, _weekNumber, _reason);
        emit CreatorRecognized(targetCreator, 0, _weekNumber, finalName, _reason);
    }

    /**
     * @dev Creator mints their recognition card
     */
    function mintMyRecognitionCard(uint32 _weekNumber) external {
        require(creatorRegistry.isActiveCreator(msg.sender), "Not a registered creator");
        require(creatorRecognizedThisWeek[msg.sender][_weekNumber], "Not recognized this week");

        Recognition memory pending = pendingRecognitions[msg.sender][_weekNumber];
        require(pending.creator == msg.sender, "No pending recognition");

        // Mint the NFT
        uint256 tokenId = _tokenIdCounter++;
        _mint(msg.sender, tokenId);

        // Store recognition data
        recognitions[tokenId] = pending;
        creatorTokenIds[msg.sender].push(tokenId);

        // NEW: Update tracking counters
        totalMintedRecognitions++;
        totalPendingRecognitions--;
        weeklyData[_weekNumber].mintedCount++;

        // Update recognition count in creator registry
        creatorRegistry.incrementRecognitionCount(msg.sender);

        // NEW: Mark as minted in VIP registry
        vipRegistry.markNominationMinted(pending.vipAddress, msg.sender, _weekNumber, tokenId);

        // Clear pending recognition
        delete pendingRecognitions[msg.sender][_weekNumber];

        emit CreatorRecognized(msg.sender, tokenId, _weekNumber, pending.creatorName, pending.reason);
    }

    // NEW: COMPREHENSIVE QUERY FUNCTIONS

    /**
     * @dev Get all pending recognitions for a creator
     */
    function getCreatorPendingRecognitions(address _creator) external view returns (Recognition[] memory) {
        uint32 currentWeek = uint32(block.timestamp / 1 weeks);
        Recognition[] memory pendingList = new Recognition[](52); // Max 52 weeks
        uint256 count = 0;

        // Check last 52 weeks for pending recognitions
        for (uint32 i = 0; i < 52; i++) {
            uint32 week = currentWeek >= i ? currentWeek - i : 0;
            if (week == 0) break;

            if (creatorRecognizedThisWeek[_creator][week] && pendingRecognitions[_creator][week].creator == _creator) {
                pendingList[count] = pendingRecognitions[_creator][week];
                count++;
            }
        }

        // Resize array to actual count
        Recognition[] memory result = new Recognition[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = pendingList[i];
        }

        return result;
    }

    /**
     * @dev Get all minted recognitions for a creator
     */
    function getCreatorMintedRecognitions(address _creator) external view returns (Recognition[] memory) {
        uint256[] memory tokens = creatorTokenIds[_creator];
        Recognition[] memory mintedList = new Recognition[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            mintedList[i] = recognitions[tokens[i]];
        }

        return mintedList;
    }

    /**
     * @dev Get creator recognition summary
     */
    function getCreatorRecognitionSummary(
        address _creator
    ) external view returns (uint256 totalCount, uint256 mintedCount, uint256 pendingCount, uint256[] memory tokenIds) {
        // Count total recognitions from history
        totalCount = creatorRecognitionHistory[_creator].length;

        // Count minted recognitions
        mintedCount = creatorTokenIds[_creator].length;

        // Calculate pending
        pendingCount = totalCount - mintedCount;

        return (totalCount, mintedCount, pendingCount, creatorTokenIds[_creator]);
    }

    /**
     * @dev Get all recognition history for a creator
     */
    function getCreatorRecognitionHistory(address _creator) external view returns (Recognition[] memory) {
        return creatorRecognitionHistory[_creator];
    }

    /**
     * @dev Get recognition for specific creator and week
     */
    function getCreatorWeeklyRecognition(
        address _creator,
        uint32 _week
    ) external view returns (bool hasRecognition, bool isMinted, Recognition memory weeklyRecognition) {
        hasRecognition = creatorRecognizedThisWeek[_creator][_week];

        if (hasRecognition) {
            weeklyRecognition = creatorWeeklyRecognitions[_creator][_week];
            // Check if it's minted by seeing if pending recognition is cleared
            isMinted = pendingRecognitions[_creator][_week].creator == address(0);
        }

        return (hasRecognition, isMinted, weeklyRecognition);
    }

    /**
     * @dev Get weekly recognition data
     */
    function getWeeklyRecognitionData(
        uint32 _week
    )
        external
        view
        returns (
            address[] memory recognizedCreators,
            address[] memory nominatingVIPs,
            uint256 totalCount,
            uint256 mintedCount
        )
    {
        WeeklyRecognitionData memory data = weeklyData[_week];
        return (data.recognizedCreators, data.nominatingVIPs, data.totalRecognitions, data.mintedCount);
    }

    /**
     * @dev Get system-wide statistics
     */
    function getSystemStats()
        external
        view
        returns (
            uint256 totalCount,
            uint256 mintedCount,
            uint256 pendingCount,
            uint256 totalCreators,
            uint256 totalVIPs
        )
    {
        totalCount = totalMintedRecognitions + totalPendingRecognitions;
        mintedCount = totalMintedRecognitions;
        pendingCount = totalPendingRecognitions;
        totalCreators = creatorRegistry.getCreatorCount();
        totalVIPs = vipRegistry.getTotalVIPs();

        return (totalCount, mintedCount, pendingCount, totalCreators, totalVIPs);
    }

    /**
     * @dev Get current week number
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

    // EXISTING FUNCTIONS (unchanged)

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        Recognition memory recognitionData = recognitions[tokenId];

        return
            string(
                abi.encodePacked(
                    '{"name": "Recognition Card #',
                    _toString(tokenId),
                    '", "description": "Weekly recognition for creator: ',
                    recognitionData.creatorName,
                    ". Reason: ",
                    recognitionData.reason,
                    '", "image": "https://your-api.com/generate-badge/',
                    _toString(tokenId),
                    '", "attributes": [',
                    '{"trait_type": "Creator", "value": "',
                    recognitionData.creatorName,
                    '"},',
                    '{"trait_type": "Week", "value": "',
                    _toString(recognitionData.weekNumber),
                    '"},',
                    '{"trait_type": "Reason", "value": "',
                    recognitionData.reason,
                    '"}',
                    "]}"
                )
            );
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    function getMyRecognitionDetails(
        uint256 tokenId
    ) external view returns (string memory reason, uint32 weekNumber, string memory creatorName) {
        require(_ownerOf(tokenId) == msg.sender, "Not your recognition card");

        Recognition memory recognitionData = recognitions[tokenId];
        return (recognitionData.reason, recognitionData.weekNumber, recognitionData.creatorName);
    }

    function getRecognitionReason(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return recognitions[tokenId].reason;
    }

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
}
