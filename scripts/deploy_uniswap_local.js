const { ethers } = require("hardhat");

async function deployUniswap() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the Uniswap V2 Factory
  const Factory = await ethers.getContractFactory("UniswapV2Factory");
  const factory = await Factory.deploy(deployer.address);
  await factory.deployed();
  console.log("UniswapV2Factory deployed to:", factory.address);

  // Deploy WETH
  const WETH = await ethers.getContractFactory("WETH9");
  const weth = await WETH.deploy();
  await weth.deployed();
  console.log("WETH deployed to:", weth.address);

  // Deploy the Uniswap V2 Router
  const Router = await ethers.getContractFactory("TestUniswapV2Router01");
  const router = await Router.deploy(factory.address, weth.address);
  await router.deployed();
  console.log("UniswapV2Router02 deployed to:", router.address//, { gasLimit: "240000000" }
    );

  console.log("UniswapV2Router02.WETH: "+(await router.WETH()));

  return {factory, weth, router};
}

module.exports = { deployUniswap }