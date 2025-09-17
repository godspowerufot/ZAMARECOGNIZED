import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { VIPRegistry, VIPRegistry__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("VIPRegistry")) as VIPRegistry__factory;
  const vipRegistryContract = (await factory.deploy()) as VIPRegistry;
  const vipRegistryContractAddress = await vipRegistryContract.getAddress();

  return { vipRegistryContract, vipRegistryContractAddress };
}

describe("VIPRegistry", function () {
  let signers: Signers;
  let vipRegistryContract: VIPRegistry;
  let vipRegistryContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    // Initialize FHEVM CLI API
    await fhevm.initializeCLIApi();

    ({ vipRegistryContract, vipRegistryContractAddress } = await deployFixture());
  });

  describe("Contract Deployment and Initialization", function () {
    it("should deploy successfully with correct owner", async function () {
      const owner = await vipRegistryContract.owner();
      expect(owner).to.equal(signers.deployer.address);
    });

    it("should have no VIPs initially", async function () {
      const aliceIsVIP = await vipRegistryContract.isVIP(signers.alice.address);
      const bobIsVIP = await vipRegistryContract.isVIP(signers.bob.address);

      expect(aliceIsVIP).to.equal(false);
      expect(bobIsVIP).to.equal(false);
    });
  });

  describe("VIP Registration with Encrypted ID", function () {
    it("should register a new VIP with encrypted ID", async function () {
      // Create encrypted VIP ID
      const clearVipId = 12345;
      const encryptedInput = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.alice.address)
        .add32(clearVipId)
        .encrypt();

      // Register VIP
      const tx = await vipRegistryContract
        .connect(signers.alice)
        .registerVIP(signers.alice, encryptedInput.handles[0], encryptedInput.inputProof);

      await tx.wait();

      // Check VIP status
      const isVIP = await vipRegistryContract.isVIP(signers.alice.address);
      expect(isVIP).to.equal(true);

      // Verify the encrypted VIP ID can be retrieved and decrypted
      const encryptedVipId = await vipRegistryContract.getEncryptedVIPId(signers.alice.address);
      const decryptedVipId = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedVipId,
        vipRegistryContractAddress,
        signers.alice,
      );

      expect(decryptedVipId).to.equal(clearVipId);
    });

    it("should emit VIPRegistered event", async function () {
      const clearVipId = 54321;
      const encryptedInput = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.bob.address)
        .add32(clearVipId)
        .encrypt();

      await expect(
        vipRegistryContract
          .connect(signers.bob)
          .registerVIP(signers.bob, encryptedInput.handles[0], encryptedInput.inputProof),
      )
        .to.emit(vipRegistryContract, "VIPRegistered")
        .withArgs(signers.bob.address);
    });

    it("should not allow duplicate VIP registration", async function () {
      // First registration
      const clearVipId = 99999;
      const encryptedInput = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.charlie.address)
        .add32(clearVipId)
        .encrypt();

      await vipRegistryContract
        .connect(signers.charlie)
        .registerVIP(signers.charlie, encryptedInput.handles[0], encryptedInput.inputProof);

      // Second registration should fail
      const encryptedInput2 = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.charlie.address)
        .add32(88888)
        .encrypt();

      await expect(
        vipRegistryContract
          .connect(signers.charlie)
          .registerVIP(signers.charlie, encryptedInput2.handles[0], encryptedInput2.inputProof),
      ).to.be.revertedWith("Already a VIP");
    });

    it("should revert when getting encrypted VIP ID for non-VIP", async function () {
      await expect(vipRegistryContract.getEncryptedVIPId(signers.bob.address)).to.be.revertedWith("Not a VIP");
    });
  });

  describe("Testing VIP Registration", function () {
    it("should allow anyone to become VIP for testing", async function () {
      const tx = await vipRegistryContract.connect(signers.alice).becomeVIPForTesting();
      await tx.wait();

      const isVIP = await vipRegistryContract.isVIP(signers.alice.address);
      expect(isVIP).to.equal(true);

      // Verify the test VIP ID is set correctly (derived from address)
      const encryptedVipId = await vipRegistryContract.getEncryptedVIPId(signers.alice.address);
      const decryptedVipId = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedVipId,
        vipRegistryContractAddress,
        signers.alice,
      );

      // The test ID should be uint32(uint160(address))
      const expectedTestId = BigInt(signers.alice.address) & BigInt("0xFFFFFFFF");
      expect(decryptedVipId).to.equal(expectedTestId);
    });

    it("should not allow duplicate testing VIP registration", async function () {
      // First registration
      await vipRegistryContract.connect(signers.bob).becomeVIPForTesting();

      // Second registration should fail
      await expect(vipRegistryContract.connect(signers.bob).becomeVIPForTesting()).to.be.revertedWith("Already a VIP");
    });

    it("should emit VIPRegistered event for testing registration", async function () {
      await expect(vipRegistryContract.connect(signers.charlie).becomeVIPForTesting())
        .to.emit(vipRegistryContract, "VIPRegistered")
        .withArgs(signers.charlie.address);
    });
  });

  describe("VIP Status Management", function () {
    beforeEach(async function () {
      // Register Alice as VIP for these tests
      await vipRegistryContract.connect(signers.alice).becomeVIPForTesting();
    });

    it("should correctly check VIP status", async function () {
      const aliceIsVIP = await vipRegistryContract.checkVIPStatus(signers.alice.address);
      const bobIsVIP = await vipRegistryContract.checkVIPStatus(signers.bob.address);

      expect(aliceIsVIP).to.equal(true);
      expect(bobIsVIP).to.equal(false);
    });

    it("should track nomination status by week", async function () {
      const week1 = 1;
      const week2 = 2;

      // Initially, VIP hasn't nominated
      let hasNominated = await vipRegistryContract.hasVIPNominatedThisWeek(signers.alice.address, week1);
      expect(hasNominated).to.equal(false);

      // Mark as nominated for week 1
      await vipRegistryContract.markNominated(signers.alice.address, week1);

      // Check nomination status
      hasNominated = await vipRegistryContract.hasVIPNominatedThisWeek(signers.alice.address, week1);
      expect(hasNominated).to.equal(true);

      // Week 2 should still be false
      hasNominated = await vipRegistryContract.hasVIPNominatedThisWeek(signers.alice.address, week2);
      expect(hasNominated).to.equal(false);
    });

    it("should not allow marking nomination for non-VIP", async function () {
      const week = 1;

      await expect(vipRegistryContract.markNominated(signers.bob.address, week)).to.be.revertedWith("Not a VIP");
    });
  });

  describe("Multiple VIPs with Different Encrypted IDs", function () {
    it("should handle multiple VIPs with different encrypted IDs", async function () {
      // Register multiple VIPs with different encrypted IDs
      const aliceVipId = 11111;
      const bobVipId = 22222;

      // Register Alice
      const aliceEncrypted = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.alice.address)
        .add32(aliceVipId)
        .encrypt();
      await vipRegistryContract
        .connect(signers.alice)
        .registerVIP(signers.alice, aliceEncrypted.handles[0], aliceEncrypted.inputProof);

      // Register Bob
      const bobEncrypted = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.bob.address)
        .add32(bobVipId)
        .encrypt();
      await vipRegistryContract
        .connect(signers.bob)
        .registerVIP(signers.bob, bobEncrypted.handles[0], bobEncrypted.inputProof);

      // Register Charlie using testing method
      await vipRegistryContract.connect(signers.charlie).becomeVIPForTesting();

      // Verify all are VIPs
      expect(await vipRegistryContract.isVIP(signers.alice.address)).to.equal(true);
      expect(await vipRegistryContract.isVIP(signers.bob.address)).to.equal(true);
      expect(await vipRegistryContract.isVIP(signers.charlie.address)).to.equal(true);

      // Verify each has their correct encrypted ID
      const aliceEncryptedId = await vipRegistryContract.getEncryptedVIPId(signers.alice.address);
      const aliceDecryptedId = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        aliceEncryptedId,
        vipRegistryContractAddress,
        signers.alice,
      );
      expect(aliceDecryptedId).to.equal(aliceVipId);

      const bobEncryptedId = await vipRegistryContract.getEncryptedVIPId(signers.bob.address);
      const bobDecryptedId = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        bobEncryptedId,
        vipRegistryContractAddress,
        signers.bob,
      );
      expect(bobDecryptedId).to.equal(bobVipId);

      // Charlie's test ID should be derived from address
      const charlieEncryptedId = await vipRegistryContract.getEncryptedVIPId(signers.charlie.address);
      const charlieDecryptedId = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        charlieEncryptedId,
        vipRegistryContractAddress,
        signers.charlie,
      );
      const expectedCharlieId = BigInt(signers.charlie.address) & BigInt("0xFFFFFFFF");
      expect(charlieDecryptedId).to.equal(expectedCharlieId);
    });

    it("should handle nomination tracking for multiple VIPs", async function () {
      // Register two VIPs
      await vipRegistryContract.connect(signers.alice).becomeVIPForTesting();
      await vipRegistryContract.connect(signers.bob).becomeVIPForTesting();

      const week1 = 1;
      const week2 = 2;

      // Mark Alice as nominated for week 1
      await vipRegistryContract.markNominated(signers.alice.address, week1);

      // Mark Bob as nominated for week 2
      await vipRegistryContract.markNominated(signers.bob.address, week2);

      // Verify individual nomination status
      expect(await vipRegistryContract.hasVIPNominatedThisWeek(signers.alice.address, week1)).to.equal(true);
      expect(await vipRegistryContract.hasVIPNominatedThisWeek(signers.alice.address, week2)).to.equal(false);

      expect(await vipRegistryContract.hasVIPNominatedThisWeek(signers.bob.address, week1)).to.equal(false);
      expect(await vipRegistryContract.hasVIPNominatedThisWeek(signers.bob.address, week2)).to.equal(true);
    });
  });

  describe("Edge Cases and Security", function () {
    it("should handle zero VIP ID encryption", async function () {
      const zeroVipId = 0;
      const encryptedInput = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.alice.address)
        .add32(zeroVipId)
        .encrypt();

      await vipRegistryContract
        .connect(signers.alice)
        .registerVIP(signers.alice, encryptedInput.handles[0], encryptedInput.inputProof);

      expect(await vipRegistryContract.isVIP(signers.alice.address)).to.equal(true);

      const encryptedVipId = await vipRegistryContract.getEncryptedVIPId(signers.alice.address);
      const decryptedVipId = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedVipId,
        vipRegistryContractAddress,
        signers.alice,
      );

      expect(decryptedVipId).to.equal(zeroVipId);
    });

    it("should handle maximum uint32 VIP ID", async function () {
      const maxVipId = 4294967295; // 2^32 - 1
      const encryptedInput = await fhevm
        .createEncryptedInput(vipRegistryContractAddress, signers.bob.address)
        .add32(maxVipId)
        .encrypt();

      await vipRegistryContract
        .connect(signers.bob)
        .registerVIP(signers.bob, encryptedInput.handles[0], encryptedInput.inputProof);

      expect(await vipRegistryContract.isVIP(signers.bob.address)).to.equal(true);

      const encryptedVipId = await vipRegistryContract.getEncryptedVIPId(signers.bob.address);
      const decryptedVipId = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedVipId,
        vipRegistryContractAddress,
        signers.bob,
      );

      expect(decryptedVipId).to.equal(maxVipId);
    });
  });
});
