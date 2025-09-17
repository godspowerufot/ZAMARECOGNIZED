// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract VIPRegistry is Ownable, SepoliaConfig {
    // VIP Management
    mapping(address => bool) public isVIP;
    mapping(address => euint32) private encryptedVIPIds;
    mapping(address => mapping(uint32 => bool)) public hasNominatedThisWeek;

    // NEW: Tracking structures
    struct VIPNomination {
        address creatorAddress;
        string creatorName;
        string reason;
        uint32 weekNumber;
        uint256 timestamp;
        bool isMinted;
        uint256 tokenId; // 0 if not minted yet
    }

    // NEW: Storage for tracking
    mapping(address => VIPNomination[]) public vipNominationHistory;
    mapping(address => uint256) public vipTotalNominations;
    mapping(address => uint256) public vipMintedNominations;
    address[] public allVIPs;
    VIPNomination[] public allNominations;

    // NEW: Weekly tracking
    mapping(uint32 => address[]) public weeklyNominators;
    mapping(uint32 => uint256) public weeklyNominationCount;

    event VIPRegistered(address indexed vip);
    event NominationRecorded(address indexed vip, address indexed creator, uint32 week);
    event NominationMinted(address indexed vip, address indexed creator, uint256 tokenId);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new VIP by passing the address, encrypted external ID, and proof
     */
    function registerVIP(address vipAddress, externalEuint32 inputEuint32, bytes calldata inputProof) external {
        require(vipAddress != address(0), "Invalid VIP address");
        require(address(vipAddress).balance >= 0.02 ether, "Insufficient Sepolia balance: need at least 0.02 ETH");
        require(!isVIP[vipAddress], "Already a VIP");

        // Convert the external encrypted input to an encrypted uint32
        euint32 encryptedId = FHE.fromExternal(inputEuint32, inputProof);

        // Mark address as VIP
        isVIP[vipAddress] = true;
        encryptedVIPIds[vipAddress] = encryptedId;
        allVIPs.push(vipAddress); // NEW: Track all VIPs

        // Grant permissions
        FHE.allowThis(encryptedId);
        FHE.allow(encryptedId, vipAddress);

        emit VIPRegistered(vipAddress);
    }

    /**
     * @dev Simple VIP access for testing (self-register)
     */
    function becomeVIPForTesting() external {
        require(!isVIP[msg.sender], "Already a VIP");

        euint32 testId = FHE.asEuint32(uint32(uint160(msg.sender)));

        isVIP[msg.sender] = true;
        encryptedVIPIds[msg.sender] = testId;
        allVIPs.push(msg.sender); // NEW: Track all VIPs

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

    /**
     * @dev Get encrypted VIP ID (for internal contract use)
     */
    function getEncryptedVIPId(address _vip) external view returns (euint32) {
        require(isVIP[_vip], "Not a VIP");
        return encryptedVIPIds[_vip];
    }

    /**
     * @dev Get encrypted VIP ID and grant access to another address
     */
    function getEncryptedVIPIdAndGrantAccess(address _recipient) external returns (euint32) {
        require(isVIP[msg.sender], "Not a VIP");
        require(_recipient != address(0), "Invalid recipient");

        euint32 encryptedId = encryptedVIPIds[msg.sender];
        FHE.allow(encryptedId, _recipient);

        return encryptedId;
    }

    /**
     * @dev Mark VIP as having nominated this week + record nomination
     */
    function markNominated(address _vip, uint32 _week) external {
        require(isVIP[_vip], "Not a VIP");
        hasNominatedThisWeek[_vip][_week] = true;

        // NEW: Track weekly nominations
        weeklyNominators[_week].push(_vip);
        weeklyNominationCount[_week]++;
    }

    /**
     * @dev NEW: Record a nomination with full details
     */
    function recordNomination(
        address _vip,
        address _creator,
        string memory _creatorName,
        string memory _reason,
        uint32 _week
    ) external {
        require(isVIP[_vip], "Not a VIP");

        VIPNomination memory nomination = VIPNomination({
            creatorAddress: _creator,
            creatorName: _creatorName,
            reason: _reason,
            weekNumber: _week,
            timestamp: block.timestamp,
            isMinted: false,
            tokenId: 0
        });

        vipNominationHistory[_vip].push(nomination);
        allNominations.push(nomination);
        vipTotalNominations[_vip]++;

        emit NominationRecorded(_vip, _creator, _week);
    }

    /**
     * @dev NEW: Update nomination as minted
     */
    function markNominationMinted(address _vip, address _creator, uint32 _week, uint256 _tokenId) external {
        require(isVIP[_vip], "Not a VIP");

        // Update in VIP's history
        VIPNomination[] storage nominations = vipNominationHistory[_vip];
        for (uint256 i = 0; i < nominations.length; i++) {
            if (
                nominations[i].creatorAddress == _creator &&
                nominations[i].weekNumber == _week &&
                !nominations[i].isMinted
            ) {
                nominations[i].isMinted = true;
                nominations[i].tokenId = _tokenId;
                vipMintedNominations[_vip]++;
                break;
            }
        }

        // Update in global history
        for (uint256 i = 0; i < allNominations.length; i++) {
            if (
                allNominations[i].creatorAddress == _creator &&
                allNominations[i].weekNumber == _week &&
                !allNominations[i].isMinted
            ) {
                allNominations[i].isMinted = true;
                allNominations[i].tokenId = _tokenId;
                break;
            }
        }

        emit NominationMinted(_vip, _creator, _tokenId);
    }

    /**
     * @dev Check if VIP has nominated this week
     */
    function hasVIPNominatedThisWeek(address _vip, uint32 _week) external view returns (bool) {
        return hasNominatedThisWeek[_vip][_week];
    }

    // NEW QUERY FUNCTIONS

    /**
     * @dev Get all nominations made by a VIP
     */
    function getVIPNominations(address _vip) external view returns (VIPNomination[] memory) {
        return vipNominationHistory[_vip];
    }

    /**
     * @dev Get VIP nomination statistics
     */
    function getVIPStats(
        address _vip
    ) external view returns (uint256 totalNominations, uint256 mintedNominations, uint256 pendingNominations) {
        totalNominations = vipTotalNominations[_vip];
        mintedNominations = vipMintedNominations[_vip];
        pendingNominations = totalNominations - mintedNominations;

        return (totalNominations, mintedNominations, pendingNominations);
    }

    /**
     * @dev Get all VIPs
     */
    function getAllVIPs() external view returns (address[] memory) {
        return allVIPs;
    }

    /**
     * @dev Get total VIP count
     */
    function getTotalVIPs() external view returns (uint256) {
        return allVIPs.length;
    }

    /**
     * @dev Get weekly nomination statistics
     */
    function getWeeklyStats(uint32 _week) external view returns (address[] memory nominators, uint256 nominationCount) {
        return (weeklyNominators[_week], weeklyNominationCount[_week]);
    }

    /**
     * @dev Get all nominations (for system analytics)
     */
    function getAllNominations() external view returns (VIPNomination[] memory) {
        return allNominations;
    }

    /**
     * @dev Get system-wide nomination statistics
     */
    function getSystemNominationStats()
        external
        view
        returns (uint256 totalNominations, uint256 totalMinted, uint256 totalPending)
    {
        totalNominations = allNominations.length;

        for (uint256 i = 0; i < allNominations.length; i++) {
            if (allNominations[i].isMinted) {
                totalMinted++;
            }
        }

        totalPending = totalNominations - totalMinted;

        return (totalNominations, totalMinted, totalPending);
    }
}
