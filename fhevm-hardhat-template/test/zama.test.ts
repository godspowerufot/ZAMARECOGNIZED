import { ethers, fhevm } from "hardhat";
import { expect } from "chai";
import type { VIPRegistry, CreatorRegistry, ZamaRecognitionMain } from "../types";
import type { Signer } from "ethers";

describe("Comprehensive Zama Recognition System Tests", function () {
  let vipRegistry: VIPRegistry;
  let creatorRegistry: CreatorRegistry;
  let recognition: ZamaRecognitionMain;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let deployer: Signer;
  let vip1: Signer, vip2: Signer, vip3: Signer;
  let creator1: Signer, creator2: Signer, creator3: Signer;
  let user: Signer; // Non-VIP, non-creator user

  let vip1Address: string, vip2Address: string, vip3Address: string;
  let creator1Address: string, creator2Address: string, creator3Address: string;
  let userAddress: string;

  beforeEach(async function () {
    [deployer, vip1, vip2, vip3, creator1, creator2, creator3, user] = await ethers.getSigners();

    // Skip if not mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    // Initialize FHEVM CLI API
    await fhevm.initializeCLIApi();

    // Deploy contracts
    const vipFactory = await ethers.getContractFactory("VIPRegistry");
    vipRegistry = (await vipFactory.deploy()) as VIPRegistry;
    await vipRegistry.waitForDeployment();

    const creatorFactory = await ethers.getContractFactory("CreatorRegistry");
    creatorRegistry = (await creatorFactory.deploy()) as CreatorRegistry;
    await creatorRegistry.waitForDeployment();

    const recognitionFactory = await ethers.getContractFactory("ZamaRecognitionMain");
    recognition = (await recognitionFactory.deploy(
      await vipRegistry.getAddress(),
      await creatorRegistry.getAddress(),
    )) as ZamaRecognitionMain;
    await recognition.waitForDeployment();

    // Get addresses
    vip1Address = await vip1.getAddress();
    vip2Address = await vip2.getAddress();
    vip3Address = await vip3.getAddress();
    creator1Address = await creator1.getAddress();
    creator2Address = await creator2.getAddress();
    creator3Address = await creator3.getAddress();
    userAddress = await user.getAddress();

    // Register VIPs
    await vipRegistry.connect(vip1).becomeVIPForTesting();
    await vipRegistry.connect(vip2).becomeVIPForTesting();
    await vipRegistry.connect(vip3).becomeVIPForTesting();

    // Register creators
    await creatorRegistry
      .connect(creator1)
      .registerCreator("Alice", "https://example.com/alice.jpg", "Blockchain developer");
    await creatorRegistry
      .connect(creator2)
      .registerCreator("Bob", "https://example.com/bob.jpg", "Smart contract auditor");
    await creatorRegistry
      .connect(creator3)
      .registerCreator("Charlie", "https://example.com/charlie.jpg", "DeFi researcher");
  });

  describe("VIPRegistry Tests", function () {
    it("should register VIPs correctly", async function () {
      expect(await vipRegistry.isVIP(vip1Address)).to.equal(true);
      expect(await vipRegistry.isVIP(vip2Address)).to.equal(true);
      expect(await vipRegistry.isVIP(vip3Address)).to.equal(true);
      expect(await vipRegistry.isVIP(userAddress)).to.equal(false);
    });

    it("should prevent duplicate VIP registration", async function () {
      await expect(vipRegistry.connect(vip1).becomeVIPForTesting()).to.be.revertedWith("Already a VIP");
    });

    it("should track total VIPs correctly", async function () {
      expect(await vipRegistry.getTotalVIPs()).to.equal(3);

      // Register one more VIP
      const [, , , , , , , , newVip] = await ethers.getSigners();
      await vipRegistry.connect(newVip).becomeVIPForTesting();
      expect(await vipRegistry.getTotalVIPs()).to.equal(4);
    });

    it("should return all VIPs", async function () {
      const allVIPs = await vipRegistry.getAllVIPs();
      expect(allVIPs).to.have.lengthOf(3);
      expect(allVIPs).to.include(vip1Address);
      expect(allVIPs).to.include(vip2Address);
      expect(allVIPs).to.include(vip3Address);
    });

    it("should track VIP nominations correctly", async function () {
      const week = await recognition.getCurrentWeek();

      // VIP1 recognizes creator1
      await recognition.connect(vip1).recognizeCreator("", creator1Address, "Great work!", week);

      // Check VIP stats
      const [total, minted, pending] = await vipRegistry.getVIPStats(vip1Address);
      expect(total).to.equal(1);
      expect(minted).to.equal(0);
      expect(pending).to.equal(1);

      // Creator mints
      await recognition.connect(creator1).mintMyRecognitionCard(week);

      // Check updated stats
      const [total2, minted2, pending2] = await vipRegistry.getVIPStats(vip1Address);
      expect(total2).to.equal(1);
      expect(minted2).to.equal(1);
      expect(pending2).to.equal(0);
    });

    it("should track weekly nominations", async function () {
      const week = await recognition.getCurrentWeek();

      await recognition.connect(vip1).recognizeCreator("", creator1Address, "Reason1", week);
      await recognition.connect(vip2).recognizeCreator("", creator2Address, "Reason2", week);

      const [nominators, count] = await vipRegistry.getWeeklyStats(week);
      expect(nominators).to.have.lengthOf(2);
      expect(count).to.equal(2);
      expect(nominators).to.include(vip1Address);
      expect(nominators).to.include(vip2Address);
    });
  });

  describe("Recognition Core Functionality", function () {
    it("should allow VIP to recognize creator and creator to mint", async function () {
      const week = await recognition.getCurrentWeek();

      // VIP recognizes creator by name
      const tx1 = await recognition
        .connect(vip1)
        .recognizeCreator("Alice", ethers.ZeroAddress, "Outstanding contribution to DeFi!", week);

      await expect(tx1)
        .to.emit(recognition, "RecognitionPending")
        .withArgs(vip1Address, creator1Address, week, "Outstanding contribution to DeFi!");

      // Check pending recognition
      expect(await recognition.hasPendingRecognition(creator1Address, week)).to.equal(true);

      // Creator mints
      const tx2 = await recognition.connect(creator1).mintMyRecognitionCard(week);

      await expect(tx2)
        .to.emit(recognition, "CreatorRecognized")
        .withArgs(creator1Address, 1, week, "Alice", "Outstanding contribution to DeFi!");

      // Verify NFT ownership
      expect(await recognition.ownerOf(1)).to.equal(creator1Address);
      expect(await recognition.totalSupply()).to.equal(1);
    });

    it("should allow recognition by address when name is empty", async function () {
      const week = await recognition.getCurrentWeek();

      await recognition.connect(vip1).recognizeCreator("", creator1Address, "Great work!", week);

      expect(await recognition.hasPendingRecognition(creator1Address, week)).to.equal(true);

      await recognition.connect(creator1).mintMyRecognitionCard(week);
      expect(await recognition.ownerOf(1)).to.equal(creator1Address);
    });

    it("should prevent duplicate recognitions in same week", async function () {
      const week = await recognition.getCurrentWeek();

      // First recognition
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Reason1", week);

      // Second recognition by same VIP should fail
      await expect(
        recognition.connect(vip1).recognizeCreator("Bob", ethers.ZeroAddress, "Reason2", week),
      ).to.be.revertedWith("Already nominated this week");
    });

    it("should prevent creator being recognized twice in same week by different VIPs", async function () {
      const week = await recognition.getCurrentWeek();

      // VIP1 recognizes Alice
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Reason1", week);

      // VIP2 tries to recognize Alice in same week
      await expect(
        recognition.connect(vip2).recognizeCreator("Alice", ethers.ZeroAddress, "Reason2", week),
      ).to.be.revertedWith("Creator already recognized this week");
    });

    it("should allow same creator to be recognized in different weeks", async function () {
      const week = await recognition.getCurrentWeek();
      const nextWeek = week + 1n;

      // Week 1 recognition
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Week1 work", week);
      await recognition.connect(creator1).mintMyRecognitionCard(week);

      // Week 2 recognition (simulate next week)
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Week2 work", nextWeek);

      expect(await recognition.hasPendingRecognition(creator1Address, nextWeek)).to.equal(true);
    });
  });

  describe("Access Control", function () {
    it("should prevent non-VIPs from recognizing creators", async function () {
      const week = await recognition.getCurrentWeek();

      await expect(
        recognition.connect(user).recognizeCreator("Alice", ethers.ZeroAddress, "Should fail", week),
      ).to.be.revertedWith("Not a registered VIP");
    });

    it("should prevent non-creators from minting", async function () {
      const week = await recognition.getCurrentWeek();

      // VIP recognizes creator1
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Great work!", week);

      // Non-creator tries to mint
      await expect(recognition.connect(user).mintMyRecognitionCard(week)).to.be.revertedWith(
        "Not a registered creator",
      );
    });

    it("should prevent creator from minting without recognition", async function () {
      const week = await recognition.getCurrentWeek();

      await expect(recognition.connect(creator1).mintMyRecognitionCard(week)).to.be.revertedWith(
        "Not recognized this week",
      );
    });

    it("should prevent double minting", async function () {
      const week = await recognition.getCurrentWeek();

      // VIP recognizes and creator mints
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Great work!", week);
      await recognition.connect(creator1).mintMyRecognitionCard(week);

      // Try to mint again
      await expect(recognition.connect(creator1).mintMyRecognitionCard(week)).to.be.revertedWith(
        "No pending recognition",
      );
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      const week = await recognition.getCurrentWeek();

      // Create some test data
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Reason1", week);
      await recognition.connect(vip2).recognizeCreator("Bob", ethers.ZeroAddress, "Reason2", week);
      await recognition.connect(vip3).recognizeCreator("Charlie", ethers.ZeroAddress, "Reason3", week);

      // Mint some cards
      await recognition.connect(creator1).mintMyRecognitionCard(week);
      await recognition.connect(creator2).mintMyRecognitionCard(week);
      // Leave creator3's unminted for testing
    });

    it("should get creator pending recognitions", async function () {
      const pending = await recognition.getCreatorPendingRecognitions(creator3Address);
      expect(pending).to.have.lengthOf(1);
      expect(pending[0].reason).to.equal("Reason3");
      expect(pending[0].creatorName).to.equal("Charlie");
    });

    it("should get creator minted recognitions", async function () {
      const minted = await recognition.getCreatorMintedRecognitions(creator1Address);
      expect(minted).to.have.lengthOf(1);
      expect(minted[0].reason).to.equal("Reason1");
      expect(minted[0].creatorName).to.equal("Alice");
    });

    it("should get creator recognition summary", async function () {
      const [total, minted, pending, tokenIds] = await recognition.getCreatorRecognitionSummary(creator1Address);

      expect(total).to.equal(1);
      expect(minted).to.equal(1);
      expect(pending).to.equal(0);
      expect(tokenIds).to.have.lengthOf(1);
      expect(tokenIds[0]).to.equal(1);
    });

    it("should get creator recognition history", async function () {
      const history = await recognition.getCreatorRecognitionHistory(creator1Address);
      expect(history).to.have.lengthOf(1);
      expect(history[0].reason).to.equal("Reason1");
      expect(history[0].vipAddress).to.equal(vip1Address);
    });

    it("should get weekly recognition data", async function () {
      const week = await recognition.getCurrentWeek();
      const [creators, vips, total, mintedCount] = await recognition.getWeeklyRecognitionData(week);

      expect(creators).to.have.lengthOf(3);
      expect(vips).to.have.lengthOf(3);
      expect(total).to.equal(3);
      expect(mintedCount).to.equal(2);
    });

    it("should get system-wide statistics", async function () {
      const [total, minted, pending, totalCreators, totalVIPs] = await recognition.getSystemStats();

      expect(total).to.equal(3);
      expect(minted).to.equal(2);
      expect(pending).to.equal(1);
      expect(totalCreators).to.equal(3);
      expect(totalVIPs).to.equal(3);
    });

    it("should check creator weekly recognition status", async function () {
      const week = await recognition.getCurrentWeek();

      const [hasRecognition1, isMinted1, recognition1] = await recognition.getCreatorWeeklyRecognition(
        creator1Address,
        week,
      );
      expect(hasRecognition1).to.equal(true);
      expect(isMinted1).to.equal(true);
      expect(recognition1.reason).to.equal("Reason1");

      const [hasRecognition3, isMinted3, recognition3] = await recognition.getCreatorWeeklyRecognition(
        creator3Address,
        week,
      );
      expect(hasRecognition3).to.equal(true);
      expect(isMinted3).to.equal(false);
      expect(recognition3.reason).to.equal("Reason3");
    });
  });

  describe("NFT Functionality", function () {
    beforeEach(async function () {
      const week = await recognition.getCurrentWeek();
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Amazing DeFi work!", week);
      await recognition.connect(creator1).mintMyRecognitionCard(week);
    });

    it("should generate correct tokenURI", async function () {
      const uri = await recognition.tokenURI(1);
      expect(uri).to.include("Recognition Card #1");
      expect(uri).to.include("Alice");
      expect(uri).to.include("Amazing DeFi work!");
    });

    it("should allow owner to get recognition details", async function () {
      const [reason, weekNumber, creatorName] = await recognition.connect(creator1).getMyRecognitionDetails(1);

      expect(reason).to.equal("Amazing DeFi work!");
      expect(creatorName).to.equal("Alice");
      expect(weekNumber).to.be.a("bigint");
    });

    it("should prevent non-owners from accessing private details", async function () {
      await expect(recognition.connect(user).getMyRecognitionDetails(1)).to.be.revertedWith(
        "Not your recognition card",
      );
    });

    it("should allow anyone to get recognition reason", async function () {
      const reason = await recognition.getRecognitionReason(1);
      expect(reason).to.equal("Amazing DeFi work!");
    });

    it("should prevent accessing non-existent tokens", async function () {
      await expect(recognition.tokenURI(999)).to.be.revertedWith("Token does not exist");

      await expect(recognition.getRecognitionReason(999)).to.be.revertedWith("Token does not exist");
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("should handle empty creator name correctly", async function () {
      const week = await recognition.getCurrentWeek();

      // Should revert when both name and address are invalid
      await expect(
        recognition.connect(vip1).recognizeCreator("", ethers.ZeroAddress, "Should fail", week),
      ).to.be.revertedWith("Must provide creator name or address");
    });

    it("should handle non-existent creator name", async function () {
      const week = await recognition.getCurrentWeek();

      await expect(
        recognition.connect(vip1).recognizeCreator("NonExistentCreator", ethers.ZeroAddress, "Should fail", week),
      ).to.be.revertedWith("Creator name not found");
    });

    it("should handle unregistered creator address", async function () {
      const week = await recognition.getCurrentWeek();

      await expect(recognition.connect(vip1).recognizeCreator("", userAddress, "Should fail", week)).to.be.revertedWith(
        "Creator not registered",
      );
    });

    it("should handle creator trying to mint wrong week", async function () {
      const week = await recognition.getCurrentWeek();
      const wrongWeek = week + 5n;

      // VIP recognizes creator for current week
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Great work!", week);

      // Creator tries to mint for wrong week
      await expect(recognition.connect(creator1).mintMyRecognitionCard(wrongWeek)).to.be.revertedWith(
        "Not recognized this week",
      );
    });

    it("should handle multiple creators with pending recognitions", async function () {
      const week = await recognition.getCurrentWeek();

      // Multiple VIPs recognize different creators
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Work1", week);
      await recognition.connect(vip2).recognizeCreator("Bob", ethers.ZeroAddress, "Work2", week);
      await recognition.connect(vip3).recognizeCreator("Charlie", ethers.ZeroAddress, "Work3", week);

      // All should have pending recognitions
      expect(await recognition.hasPendingRecognition(creator1Address, week)).to.equal(true);
      expect(await recognition.hasPendingRecognition(creator2Address, week)).to.equal(true);
      expect(await recognition.hasPendingRecognition(creator3Address, week)).to.equal(true);

      // All should be able to mint
      await recognition.connect(creator1).mintMyRecognitionCard(week);
      await recognition.connect(creator2).mintMyRecognitionCard(week);
      await recognition.connect(creator3).mintMyRecognitionCard(week);

      expect(await recognition.totalSupply()).to.equal(3);
    });
  });

  describe("Integration Tests", function () {
    it("should handle complete workflow with multiple weeks", async function () {
      const currentWeek = await recognition.getCurrentWeek();
      const nextWeek = currentWeek + 1n;

      // Week 1: VIP1 recognizes Alice, VIP2 recognizes Bob
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Week1 Alice", currentWeek);
      await recognition.connect(vip2).recognizeCreator("Bob", ethers.ZeroAddress, "Week1 Bob", currentWeek);

      // Only Alice mints in week 1
      await recognition.connect(creator1).mintMyRecognitionCard(currentWeek);

      // Week 2: VIP3 recognizes Charlie, VIP1 recognizes Bob (different creator)
      await recognition.connect(vip3).recognizeCreator("Charlie", ethers.ZeroAddress, "Week2 Charlie", nextWeek);
      await recognition.connect(vip1).recognizeCreator("Bob", ethers.ZeroAddress, "Week2 Bob", nextWeek);

      // Bob mints his week 1 recognition late
      await recognition.connect(creator2).mintMyRecognitionCard(currentWeek);

      // Charlie mints week 2 recognition
      await recognition.connect(creator3).mintMyRecognitionCard(nextWeek);

      // Verify final state
      expect(await recognition.totalSupply()).to.equal(3);

      const [total, minted, pending] = await recognition.getSystemStats();
      expect(total).to.equal(4); // 4 total recognitions created
      expect(minted).to.equal(3); // 3 minted
      expect(pending).to.equal(1); // 1 pending (Bob's week 2)
    });

    it("should maintain data integrity across complex scenarios", async function () {
      const week = await recognition.getCurrentWeek();

      // Create recognitions
      await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Outstanding work", week);
      await recognition.connect(vip2).recognizeCreator("Bob", ethers.ZeroAddress, "Great research", week);

      // Mint one, leave one pending
      await recognition.connect(creator1).mintMyRecognitionCard(week);

      // Check VIP nomination tracking
      const vip1Nominations = await vipRegistry.getVIPNominations(vip1Address);
      expect(vip1Nominations).to.have.lengthOf(1);
      expect(vip1Nominations[0].isMinted).to.equal(true);

      const vip2Nominations = await vipRegistry.getVIPNominations(vip2Address);
      expect(vip2Nominations).to.have.lengthOf(1);
      expect(vip2Nominations[0].isMinted).to.equal(false);

      // Check creator statistics

      // Check system statistics
      const [totalSystem] = await vipRegistry.getSystemNominationStats();
      expect(totalSystem).to.equal(2);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("should handle batch operations efficiently", async function () {
      const week = await recognition.getCurrentWeek();

      // Recognize multiple creators in sequence
      const tx1 = await recognition.connect(vip1).recognizeCreator("Alice", ethers.ZeroAddress, "Work1", week);
      const receipt1 = await tx1.wait();

      const tx2 = await recognition.connect(vip2).recognizeCreator("Bob", ethers.ZeroAddress, "Work2", week);
      const receipt2 = await tx2.wait();

      const tx3 = await recognition.connect(vip3).recognizeCreator("Charlie", ethers.ZeroAddress, "Work3", week);
      const receipt3 = await tx3.wait();

      // All transactions should succeed
      expect(receipt1?.status).to.equal(1);
      expect(receipt2?.status).to.equal(1);
      expect(receipt3?.status).to.equal(1);

      // Mint all recognitions
      await recognition.connect(creator1).mintMyRecognitionCard(week);
      await recognition.connect(creator2).mintMyRecognitionCard(week);
      await recognition.connect(creator3).mintMyRecognitionCard(week);

      expect(await recognition.totalSupply()).to.equal(3);
    });
  });
});
