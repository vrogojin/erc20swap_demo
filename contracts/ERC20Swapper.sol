// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IERC20Swapper.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router01.sol";

contract ERC20Swapper is Initializable, AccessControlUpgradeable, IERC20Swapper {

    bytes4 private constant uniswap_func_sig = bytes4(keccak256("swapExactETHForTokens(uint256,address[],address,uint256)"));

    IUniswapV2Router01 private _router;
    IERC20 private _weth;

    uint256[126] private __gap;

    modifier isAdmin(){
	if(!hasRole(DEFAULT_ADMIN_ROLE, msg.sender))
	    revert ERC20Swapper_NonAdmin_Unauthorized(msg.sender);
        _;
    }

    function initialize() public initializer {
	AccessControlUpgradeable.__AccessControl_init();

	_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setRouter(address router_addr) public isAdmin {
	_router = IUniswapV2Router01(router_addr);
	_weth = IERC20(_router.WETH());
	emit SetRouter(router_addr);
    }

    function swapEtherToToken(address token, uint minAmount) override public payable returns (uint){
	address[] memory path = new address[](2);
        path[0] = address(_weth);
        path[1] = token;
	uint256[] memory amounts = _router.swapExactETHForTokens{value: msg.value}(
	    minAmount, 
	    path, 
	    msg.sender, 
	    block.timestamp);

	emit Swap(amounts[0], token, amounts[1]);
	return amounts[1];
    }

}
