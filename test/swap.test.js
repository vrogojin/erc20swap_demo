const { expect } = require("chai");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployUpgradeSwapper } = require("../scripts/deploy_upgrade.js");
const { deployUniswap } = require("../scripts/deploy_uniswap_local.js");
const { deployTestToken } = require("../scripts/deploy_test_erc20.js");

async function deployContractsFixture() {
    const [deployer_addr, addr1, addr2] = await ethers.getSigners();

    const swapper = await deployUpgradeSwapper();
    const {factory, weth, router} = await deployUniswap();
    const token = await deployTestToken();

    await swapper.setRouter(router.address);

    return { swapper, factory, weth, router, token, deployer_addr, addr1, addr2 };
}

describe("Token contract", () => {

  let swapper;
  let factory;
  let weth;
  let router;
  let token;
  let deployer_addr;
  let addr1;
  let addr2;

  beforeEach(async () => {
    ({ swapper, factory, weth, router, token, deployer_addr, addr1, addr2 } = await loadFixture(deployContractsFixture));
  });

    describe("Swap tokens for ETH", () => {

	const tokenDesired = ethers.utils.parseEther("100.0");
	const tokenMin = ethers.utils.parseEther("10.0");
	const etherMin = ethers.utils.parseEther("1.0");

	beforeEach(async () => {
	    const deadline = Math.floor((new Date((new Date()).getTime() + 60 * 1000)).getTime() / 1000);
	    await token.approve(router.address, tokenDesired);
	    await router.addLiquidityETH(token.address, tokenDesired, tokenMin, etherMin, 
		deployer_addr.address, deadline, {value: ethers.utils.parseEther("35.0")});

	
	});

	it("Swap ETH for Token", async () => {
	    await swapper.connect(addr1).swapEtherToToken(token.address, etherMin, 
		{value: ethers.utils.parseEther("10.0")});
	});

    });

});
