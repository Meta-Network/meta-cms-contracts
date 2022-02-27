import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";
import { MetaSpaceManagement, Greeter } from "../types";

declare module "mocha" {
  export interface Context {
    greeter: Greeter;
    management: MetaSpaceManagement;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
  }
}

export interface Signers {
  admin: SignerWithAddress;
  second: SignerWithAddress;
}
