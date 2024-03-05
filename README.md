# erc20swap_demo Project

Solution for the task is to create a simple Solidity contract for exchanging Ether to an arbitrary ERC-20.
This solution ERC20Swapper.sol is the integration into Uniswap V2 platform. The contract iself serves as a relay
between the user (can be an EOA or another contract) and Uniswap contract stack. ERC20Swapper interracts
with Uniswap through the router contract and executes ether to erc20 token swaps via UniswapV2Router01.swapExactETHForTokens
method call.

For testing purposes, we also adapted Uniswap V2 deployment for local chai unit tests within Hardhat environment.

## Installation

Prerequisits: NodeJS (tested on v18.16.1, version adjusted for dependences requirements) and npm (tested on 9.5.1).
Recommended: Use n (npm install n -g) for node version management

For installing the project run ¨npm install" in the project root folder

## Compiling Smart Contracts

Run "npx hardhat compile"

## Running unit tests

Run "npx hardhat test"

## Test network

 * Network: Sepolia
 * ERC20Swapper: 0xdDc95ae0483786503338A6a8e53A97A3345A85b5
 * TestERC20Token: 0x233695eEDc300069897287FB2eF9b3Ca74BdfC16
 * Uniswap v2 router (not from this project): 0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008

## Contracts

### ERC20Swapper.sol

This contract implements a token swapper using Uniswap V2 router, allowing swapping of Ether to any ERC20 token. It uses the Transparent Proxy Pattern for upgradability.

### IERC20Swapper.sol

Interface for ERC20Swapper

### test/

Contains Uniswap setup for local hardhat test environment. We have unit tests for ERC20Swapper to run
against the local Uniswap setup

## Scripts

### deploy.js

Deploys/upgrades ERC20Swapper and ERC20 test token

### deploy_test_erc20.js

Routines for deploying ERC20 test token

### deploy_uniswap_local.js

Routines for deploying local Uniswap V2 setup

### deploy_upgrade.js

Routines for deploying/upgrading ERC20Swapper
