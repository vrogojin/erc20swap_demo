const { expect } = require("chai");
const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");

const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { deployUpgradeSwapper } = require("../scripts/deploy_upgrade.js");
const { deployUniswap } = require("../scripts/deploy_uniswap_local.js");
const { deployTestToken } = require("../scripts/deploy_test_erc20.js");

/**
 * Sets up a local test environment by deploying ERC20Swapper, Uniswap contracts, and a test token.
 * Configures the ERC20Swapper to work with Uniswap.
 *
 * @async
 * @returns {Promise<Object>} An object containing instances of the deployed contracts and signer addresses.
 */
async function deployContractsFixture() {
    const [deployer_addr, addr1, addr2] = await ethers.getSigners();

    const swapper = await deployUpgradeSwapper(); //ERC20Swapper
    const {factory, weth, router} = await deployUniswap(); // Uniswap contracts
    const token = await deployTestToken(); // ERC20 test token

    await swapper.setRouter(router.address); // Setting Uniswap router in ERC20Swapper contract

    return { swapper, factory, weth, router, token, deployer_addr, addr1, addr2 };
}

/**
 * Calculates the expected amount of tokens to receive for a given ether payment, based on the standard formula defined in the Uniswap protocol.
 *
 * @param {BigNumber} init_ether - Current WETH balance in the pair.
 * @param {BigNumber} init_token - Current token balance in the pair.
 * @param {BigNumber} ether_amount - Ether paid.
 * @param {BigNumber} fee - Swapping fee, in this context 0.3%.
 * @returns {BigNumber} The expected amount of tokens.
 */
function calculateExpectedAmount(init_ether, init_token, ether_amount, fee){
    const k = init_ether.mul(init_token);
    const oneMinusFee = ethers.BigNumber.from(1e6).sub(fee); // 1 - fee, adjusted for precision
    const adjustedEthSent = ether_amount.mul(oneMinusFee).div(ethers.BigNumber.from(1e6)); // Adjusting for fee precision, 6 digits

    return init_token.sub(k.div(init_ether.add(adjustedEthSent))); // y - ( k / ( x + ether_amount * ( 1 - fee ) )), where x = init_ether, y = init_token, k = x*y
}

/**
 * Compares ether (to any ERC20 token) balances with precision up to 0.001.
 *
 * @param {BigNumber} x - The first amount to compare.
 * @param {BigNumber} y - The second amount to compare.
 * @throws {AssertionError} If the amounts do not match with the specified precision.
 */
function compareAmounts(x, y){
    const precision_digits = 15;
    expect(
	x.toString().slice(0, -precision_digits),
	y.toString().slice(0, -precision_digits)
    );
}

/**
 * Tests ether to ERC20 token swap.
 *
 * @async
 * @param {Address} by_addr - The caller address (can be either EOA or another contract).
 * @param {Contract} swapper - The ERC20Swapper instance.
 * @param {Contract} token - An ERC20 token contract instance.
 * @param {BigNumber} init_ether - Current WETH balance in the pair.
 * @param {BigNumber} init_token - Current token balance in the pair.
 * @param {BigNumber} ether_amount - Ether paid.
 * @param {BigNumber} token_min - The minimal amount of tokens to be received.
 * @param {BigNumber} fee - Swapping commission fee, specifically 0.3% in this test.
 * @param {string} [fail_msg] - The expected revert message if a failure is anticipated.
 * @returns {Promise<void>}
 */
async function swap_test(by_addr, swapper, token, init_ether, init_token, ether_amount, token_min, fee, fail_msg){
	    if(fail_msg){
		await expectRevert(
		    swapper.connect(by_addr).swapEtherToToken(token.address, token_min, 
			{value: ether_amount}),
			fail_msg
		);
		return;
	    }
	    const expected_token_amount = calculateExpectedAmount(init_ether, init_token, 
		ether_amount, fee); // expected amount to receive
	    const tx = await swapper.connect(by_addr).swapEtherToToken(token.address, token_min, 
		{value: ether_amount}); // swap tx object
	    const receipt = await tx.wait(); // swap tx receipt
	    const swap_event = receipt.events.find(e => e.event === "Swap"); // swap event
	    expect(ethers.BigNumber.from(ether_amount).toString() === 
		ethers.BigNumber.from(swap_event.args[0]).toString()); // confirm ethere amount sent
	    expect(swapper.address.toString().toLowerCase() === 
		swap_event.args[1].toString().toLowerCase()); // confirm swapper contract address
	    const tokens_received = ethers.BigNumber.from(swap_event.args[2]);
	    compareAmounts(expected_token_amount, tokens_received); // confirm that correct amount of tokens have been received
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

    describe("Set router in Swapper by non-admin", () => {

	it("fail", async() => {
	    await expectRevert(
		swapper.connect(addr1).setRouter(router.address),
		`ERC20Swapper_NonAdmin_Unauthorized("${addr1.address}")`
	    )
	});

    });

    describe("Swap tokens for ETH", () => {

	const tokenDesired = ethers.utils.parseEther("50.0");
	const etherDesired = ethers.utils.parseEther("50.0");
	const tokenMin = ethers.utils.parseEther("10.0");
	const etherMin = ethers.utils.parseEther("10.0");
	const fee = ethers.BigNumber.from(3000); // 0.3%
	const swap_ether_amount = ethers.utils.parseEther("30.0"); // 30 ether to swap by addr1 in the first test
	const swap_ether_amount1 = ethers.utils.parseEther("20.0"); // 20 ether to swap by addr1 in the second test
	const swap_ether_amount2 = ethers.utils.parseEther("50.0"); // 50 ether to swap by addr2 in the second test
	const swap_ether_small_amount = etherMin.sub(1); // swap less in order to get under the min token cap

	beforeEach(async () => {
	    const deadline = Math.floor((new Date((new Date()).getTime() + 60 * 1000)).getTime() / 1000);
	    await token.approve(router.address, tokenDesired);
	    await router.addLiquidityETH(token.address, tokenDesired, tokenMin, etherMin, 
		deployer_addr.address, deadline, {value: etherDesired});
	});

	it("Swap ETH for Token by addr1", async () => {
	    await swap_test(addr1, swapper, token, etherDesired, tokenDesired, swap_ether_amount, tokenMin, fee); // swap
	});

	it("Swap ETH for Token by addr1, then by addr2", async () => {
	    await swap_test(addr1, swapper, token, etherDesired, tokenDesired, swap_ether_amount1, tokenMin, fee); // first swap by addr1
	    await swap_test(addr2, swapper, token, etherDesired.add(swap_ether_amount1), // ether has been added to the pair in the previous swap
		tokenDesired.sub(calculateExpectedAmount(etherDesired, tokenDesired, swap_ether_amount1, fee)), // token has been removed from the pair after the previous swap
		swap_ether_amount2, 
		etherMin, 
		fee); // second swap by addr2. Correct ether and token amounts in the LP
	});

	it("Swap less than min desired token", async () => {
	    await swap_test(addr1, swapper, token, etherDesired, tokenDesired, swap_ether_small_amount, etherMin, fee, 
		'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT'); //swap should fail
	});

    });

});
