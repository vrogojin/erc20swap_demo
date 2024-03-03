//require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require("@openzeppelin/hardhat-upgrades");

//require("@nomicfoundation/hardhat-toolbox");


// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
///  solidity: "0.8.20",
  solidity: {
    compilers: [
	{
	    version: "0.8.20",
//	    settings: { optimizer: { enabled: true, runs: 200 } },
	},
	{
	    version: "0.5.16",
	    settings: { optimizer: { enabled: true, runs: 200 } },
	},
	{
	    version: "0.6.6",
	    settings: { optimizer: { enabled: true, runs: 200 } },
	},
    ]
  },
  networks: {
    hardhat: {
	chainId: 31337,
//	blockGasLimit: 3200000000
    }
  }
};
