import { artifacts, waffle } from "hardhat";
import { MetaSpaceManagement } from "../../types";
import { shouldBehaveLikeMetaSpaceManagement } from "./MetaSpaceManagement.behavior";

describe("Unit tests", function () {
  describe("MetaSpaceManagement", function () {
    beforeEach(async function () {
      const args: string[] = ["Meta Space Management", "1"];
      const artifact = await artifacts.readArtifact("MetaSpaceManagement");
      const instance = <MetaSpaceManagement>await waffle.deployContract(this.signers.admin, artifact, args);
      this.management = instance;
    });

    shouldBehaveLikeMetaSpaceManagement();
  });
});
