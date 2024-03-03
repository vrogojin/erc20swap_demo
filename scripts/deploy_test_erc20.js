const { ethers } = require("hardhat");

async function deployTestToken() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  // Deploy the Uniswap V2 Factory
  const TestToken = await ethers.getContractFactory("TestERC20");
  const token = await TestToken.deploy();
  await token.deployed();
  console.log("Test token deployed to:", token.address);

  return token;
}

module.exports = { deployTestToken }