import { task } from "hardhat/config";
import { TaskArguments } from "hardhat/types";
import { Greeter } from "../../types";

task("deploy:Greeter")
  .addParam("greeting", "Say hello, be nice")
  .setAction(async function (taskArguments: TaskArguments, { ethers, upgrades }) {
    const greeterFactory = await ethers.getContractFactory("Greeter");
    const greeter = <Greeter>(
      await upgrades.deployProxy(greeterFactory, [taskArguments.greeting], { initializer: "initialize" })
    );
    await greeter.deployed();
    console.log("Greeter deployed to: ", greeter.address);
  });

task("upgrade:Greeter").setAction(async function (_, { ethers, upgrades }) {
  const greeterV1 = await ethers.getContractAt("Greeter", "0x7AedaD5614470eBC0eA62B33D1cEF620043A2262");
  const greeterV2Factory = await ethers.getContractFactory("GreeterV2");
  await upgrades.upgradeProxy(greeterV1, greeterV2Factory);
  console.log("Greeter upgraded");
});
