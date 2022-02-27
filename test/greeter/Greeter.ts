import { ethers, upgrades } from "hardhat";
import { Greeter } from "../../types";
import { shouldBehaveLikeGreeter } from "./Greeter.behavior";

describe("Unit tests", function () {
  describe("Greeter", function () {
    beforeEach(async function () {
      const greeting = "Hello, world!";
      const factory = await ethers.getContractFactory("Greeter");
      this.greeter = <Greeter>await upgrades.deployProxy(factory, [greeting], { initializer: "initialize" });
    });

    shouldBehaveLikeGreeter();
  });
});
