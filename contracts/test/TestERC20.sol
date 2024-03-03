// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";

contract TestERC20 is ERC20PresetFixedSupply{

    constructor() ERC20PresetFixedSupply("Test ERC20 token", "VTT", 10000 ether, msg.sender){

    }

}
