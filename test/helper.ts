import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
dotenvConfig({ path: resolve(__dirname, "../.env") });
import { Signers } from "./types";

before(async function () {
  this.signers = {} as Signers;

  const signers: SignerWithAddress[] = await ethers.getSigners();
  this.signers.admin = signers[0];
  this.signers.second = signers[1];

  console.log("Admin accounts:", this.signers.admin.address, "\n");
});
