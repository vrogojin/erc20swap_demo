// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20Swapper.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";

/**
 * @title ERC20Swapper
 * @dev This contract implements a token swapper using Uniswap V2 router, allowing swapping of Ether to any ERC20 token. It uses the Transparent Proxy Pattern for upgradability.
*/
contract ERC20Swapper is Initializable, AccessControlUpgradeable, IERC20Swapper {

    // Tracing contract implementation version
    uint256 public constant VERSION = 1;

    IUniswapV2Router01 private _router; // Uniswap v2 router
    IERC20 private _weth; // ETH wrapper

    uint256[126] private __gap; // Storage reserve for potential contract upgrades with new variables

    /**
     * @dev Modifier to make a function callable only by an admin.
     */
    modifier isAdmin(){
	if(!hasRole(DEFAULT_ADMIN_ROLE, msg.sender))
	    revert ERC20Swapper_NonAdmin_Unauthorized(msg.sender);
        _;
    }

    /**
     * @dev Initializes the contract setting the deployer as the initial admin.
     */
    function initialize() public initializer {
	AccessControlUpgradeable.__AccessControl_init();

	_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Sets the Uniswap router and initializes ETH wrapper contract references.
     * Can only be called by an admin.
     * 
     * @param router_addr The address of the Uniswap V2 router.
     */
    function setRouter(address router_addr) public isAdmin {
	_router = IUniswapV2Router01(router_addr);
	_weth = IERC20(_router.WETH());
	emit SetRouter(router_addr);
    }

    /**
     * @dev Swaps Ether to a specified ERC20 token.
     * Implements the `swapEtherToToken` function defined in the `IERC20Swapper` interface.
     * 
     * @param token The address of the ERC20 token to swap to.
     * @param minAmount The minimum desired amount of tokens to be received from the swap.
     * @return The amount of tokens received from the swap.
     */
    function swapEtherToToken(address token, uint minAmount) override public payable returns (uint){
	// Define liquidity pairs path for the swap. In our case, we assume we have direct Token-WETH pair in the Uniswap pool
	address[] memory path = new address[](2);
        path[0] = address(_weth);
        path[1] = token;

	// Relay ETH to Token swap call to the Uniswap platform through the router contract
	uint256[] memory amounts = _router.swapExactETHForTokens{value: msg.value}(
	    minAmount, // minimal desired amount of tokens to receive
	    path, // the pair path
	    msg.sender, // the caller should receive tokens for the ether
	    block.timestamp); // we assume deadline to be set to the time when the swapping transaction is included in the ledger

	emit Swap(amounts[0], token, amounts[1]); // Emitting the event in order to access the swaping results (how much ether for what and how much tokens have been swapped)
	return amounts[1]; // This return value (amount of tokens received) can be used by the calling smart conbtract in its logic. Dapps should access this value via TX receipt event records
    }

}
