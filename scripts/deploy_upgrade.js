const { ethers, upgrades } = require("hardhat");
const path = require("path");
const fs = require("fs");

const CONTRACT_NAME = "ERC20Swapper";
const DEPLOYMENT_FILE = path.join(__dirname, "../deployments/"+network.name+"/deploymentAddress.json");

async function deployUpgradeSwapper(){
  if (network.name === "hardhat") {
    if (fs.existsSync(DEPLOYMENT_FILE)) {
        fs.unlinkSync(DEPLOYMENT_FILE);
    }
  }

  const proxyAddress = getDeploymentAddress();
  const Contract = await ethers.getContractFactory(CONTRACT_NAME);
  let contract;

  if (proxyAddress) {
        console.log(`Upgrading ${CONTRACT_NAME} at proxy address ${proxyAddress}...`);
        contract = await upgrades.upgradeProxy(proxyAddress, Contract);
        console.log(`${CONTRACT_NAME} upgraded at proxy address:`, contract.address);
    } else {
        console.log(`Deploying ${CONTRACT_NAME}...`);
        contract = await upgrades.deployProxy(Contract, [], ethers.getSigners()[0]);
        await contract.deployed();
        console.log(`${CONTRACT_NAME} deployed to:`, contract.address);
        saveDeploymentAddress(contract.address);
    }

    return contract;
}

// Helper function to read the deployment address
function getDeploymentAddress() {
    if (fs.existsSync(DEPLOYMENT_FILE)) {
        const deploymentData = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE));
        return deploymentData.proxyAddress || "";
    }
    return "";
}

// Helper function to save the deployment address
function saveDeploymentAddress(address) {
    const deploymentData = { proxyAddress: address };

    fs.mkdirSync(path.dirname(DEPLOYMENT_FILE), { recursive: true });
    fs.writeFileSync(DEPLOYMENT_FILE, JSON.stringify(deploymentData, null, 2));
}

module.exports = {
    deployUpgradeSwapper,
    getDeploymentAddress,
    saveDeploymentAddress
}
