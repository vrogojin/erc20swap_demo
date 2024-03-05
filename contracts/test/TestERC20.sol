// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";

/**
 * @title TestERC20
 * @dev Here we implement a mock ERC20 token 
 */
contract TestERC20 is ERC20PresetFixedSupply{

    constructor() ERC20PresetFixedSupply("Test ERC20 token", "VTT", 10000 ether, msg.sender){

    }

}
