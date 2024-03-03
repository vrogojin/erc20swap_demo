// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20Swapper{
    error ERC20Swapper_NonAdmin_Unauthorized(address);
    error ERC20Swapper_NotUniswapRouter_v2(address);

    event SetRouter(address);
    event Swap(uint256, address, uint256);

    /// @dev swaps the `msg.value` Ether to at least `minAmount` of tokens in `address`, or reverts
    /// @param token The address of ERC-20 token to swap
    /// @param minAmount The minimum amount of tokens transferred to msg.sender
    /// @return The actual amount of transferred tokens
    function swapEtherToToken(address token, uint minAmount) external payable returns (uint);
}
