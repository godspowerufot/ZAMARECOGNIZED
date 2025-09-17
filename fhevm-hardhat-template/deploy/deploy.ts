import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying contracts with account:", deployer);

  // Common EIP-1559 gas settings
  const feeData = await ethers.provider.getFeeData();
  const gasOverrides = {
    maxFeePerGas: (feeData.maxFeePerGas ?? ethers.parseUnits("30", "gwei")).toString(),
    maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas ?? ethers.parseUnits("2", "gwei")).toString(),
  };

  // 1. Deploy VIP Registry
  console.log("\n📝 Deploying VIP Registry...");
  const vipRegistry = await deploy("VIPRegistry", {
    from: deployer,
    args: [],
    log: true,
    ...gasOverrides,
  });

  // 2. Deploy Creator Registry
  console.log("\n👨‍💻 Deploying Creator Registry...");
  const creatorRegistry = await deploy("CreatorRegistry", {
    from: deployer,
    args: [],
    log: true,
    ...gasOverrides,
  });

  // 3. Deploy Main Recognition Contract
  console.log("\n🎖️ Deploying Main Recognition Contract...");
  const mainContract = await deploy("ZamaRecognitionMain", {
    from: deployer,
    args: [vipRegistry.address, creatorRegistry.address],
    log: true,
    ...gasOverrides,
  });

  // Summary
  console.log("\n🎉 Deployment Complete!");
  console.log("=====================================");
  console.log("VIP Registry:", vipRegistry.address);
  console.log("Creator Registry:", creatorRegistry.address);
  console.log("Main Contract:", mainContract.address);
  console.log("=====================================");
};

export default func;
func.tags = ["ZamaRecognition"];
