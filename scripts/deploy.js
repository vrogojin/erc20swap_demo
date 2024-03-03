const { deployUpgradeSwapper } = require("./deploy_upgrade.js");
const { deployTestToken } = require("./deploy_test_erc20.js");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  await deployUpgradeSwapper();
  await deployTestToken();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
