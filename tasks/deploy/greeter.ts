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
