import { TypedDataDomain, TypedDataField } from "@ethersproject/abstract-signer";
import { splitSignature } from "@ethersproject/bytes";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { MetaSpaceManagement } from "../../types";

export function shouldBehaveLikeMetaSpaceManagement(): void {
  const ACTION_TYPE_HASH = "0x3ecdfbf2d4e24450739241e23bcfd951fdaa49249d85b1fc83095461da25f244";
  const AUTHORIZATION_TYPE_HASH = "0x473cb7bb0d2b4fdb101fb42e27d9c724ff5047a8e6c3257a66cf0c58a6bfa464";
  const VERIFICATION_TYPE_HASH = "0x061ac023905fd26ab205363beefec5a7cb11644bb81a427fcbaae6d4ca248128";
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const GLOBAL_ADMINISTRATOR_ROLE = "0x71919694860dd432d22365f2619a987b567cfb082baca386cb215299a513d3ba";
  const VERIFICATION_PAYLOAD_AUTHOR_ROLE = "0xb940cd9a9f1e5a1b930f69c0b106438587cf89ccc9eef40e2a29b12f44e2cc58";
  const defaultDomain: TypedDataDomain = {
    chainId: 31337,
    name: "Meta Space Management",
    version: "1",
  };
  // const domainTypes: Record<string, TypedDataField[]> = {
  //   EIP712Domain: [
  //     { name: "name", type: "string" },
  //     { name: "version", type: "string" },
  //     { name: "chainId", type: "uint256" },
  //     { name: "verifyingContract", type: "address" },
  //   ],
  // };
  const actionTypes: Record<string, TypedDataField[]> = {
    Action: [
      { name: "initiator", type: "address" },
      { name: "name", type: "string" },
    ],
  };
  const authorizationTypes: Record<string, TypedDataField[]> = {
    Authorization: [
      { name: "user", type: "address" },
      { name: "timestamp", type: "uint256" },
    ],
  };
  const verificationTypes: Record<string, TypedDataField[]> = {
    Verification: [
      { name: "server", type: "address" },
      { name: "user", type: "address" },
      { name: "timestamp", type: "uint256" },
      { name: "v", type: "uint8" },
      { name: "r", type: "bytes32" },
      { name: "s", type: "bytes32" },
    ],
  };

  it("should bytes32 public constant equal Keccak-256 hash", async function () {
    const instance = this.management.connect(this.signers.admin);

    expect(await instance.ACTION_TYPE_HASH()).to.equal(ACTION_TYPE_HASH);
    expect(await instance.AUTHORIZATION_TYPE_HASH()).to.equal(AUTHORIZATION_TYPE_HASH);
    expect(await instance.VERIFICATION_TYPE_HASH()).to.equal(VERIFICATION_TYPE_HASH);
    expect(await instance.DEFAULT_ADMIN_ROLE()).to.equal(DEFAULT_ADMIN_ROLE);
    expect(await instance.GLOBAL_ADMINISTRATOR_ROLE()).to.equal(GLOBAL_ADMINISTRATOR_ROLE);
    expect(await instance.VERIFICATION_PAYLOAD_AUTHOR_ROLE()).to.equal(VERIFICATION_PAYLOAD_AUTHOR_ROLE);
  });

  it("should getRoleAdmin equal DEFAULT_ADMIN_ROLE", async function () {
    const instance = this.management.connect(this.signers.admin);

    expect(await instance.getRoleAdmin(DEFAULT_ADMIN_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    expect(await instance.getRoleAdmin(GLOBAL_ADMINISTRATOR_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
    expect(await instance.getRoleAdmin(VERIFICATION_PAYLOAD_AUTHOR_ROLE)).to.equal(DEFAULT_ADMIN_ROLE);
  });

  it("should admin account has DEFAULT_ADMIN_ROLE role by default", async function () {
    const instance = this.management.connect(this.signers.admin);

    expect(await instance.hasRole(DEFAULT_ADMIN_ROLE, this.signers.admin.address)).is.true;
  });

  it("should admin account has GLOBAL_ADMINISTRATOR_ROLE role by default", async function () {
    const instance = this.management.connect(this.signers.admin);

    expect(await instance.hasRole(GLOBAL_ADMINISTRATOR_ROLE, this.signers.admin.address)).is.false;
  });

  it("should admin account has VERIFICATION_PAYLOAD_AUTHOR_ROLE role by default", async function () {
    const instance = this.management.connect(this.signers.admin);

    expect(await instance.hasRole(VERIFICATION_PAYLOAD_AUTHOR_ROLE, this.signers.admin.address)).is.false;
  });

  it("should admin account can grant GLOBAL_ADMINISTRATOR_ROLE role", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.admin.address;
    await instance.grantRole(GLOBAL_ADMINISTRATOR_ROLE, address);

    expect(await instance.hasRole(GLOBAL_ADMINISTRATOR_ROLE, address)).is.true;
  });

  it("should admin account can grant VERIFICATION_PAYLOAD_AUTHOR_ROLE role", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.admin.address;
    await instance.grantRole(VERIFICATION_PAYLOAD_AUTHOR_ROLE, address);

    expect(await instance.hasRole(VERIFICATION_PAYLOAD_AUTHOR_ROLE, address)).is.true;
  });

  it("should admin account is contract owner", async function () {
    const instance = this.management.connect(this.signers.admin);

    expect(await instance.owner()).to.equal(this.signers.admin.address);
  });

  it("should admin account renounce ownership", async function () {
    const instance = this.management.connect(this.signers.admin);
    await instance.renounceOwnership();

    expect(await instance.owner()).to.equal("0x0000000000000000000000000000000000000000");
  });

  it("should admin account renounce role", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.admin.address;
    await instance.renounceRole(DEFAULT_ADMIN_ROLE, address);

    expect(await instance.hasRole(DEFAULT_ADMIN_ROLE, address)).is.false;
  });

  it("should other account renounce admin account role fail", async function () {
    const instance = this.management.connect(this.signers.second);

    try {
      await instance.renounceRole(DEFAULT_ADMIN_ROLE, this.signers.admin.address);
    } catch (error) {
      expect(error).instanceOf(Error);
    }
  });

  it("should admin account revoke role", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.second.address;

    expect(await instance.hasRole(GLOBAL_ADMINISTRATOR_ROLE, address)).is.false;
    await instance.grantRole(GLOBAL_ADMINISTRATOR_ROLE, address);
    expect(await instance.hasRole(GLOBAL_ADMINISTRATOR_ROLE, address)).is.true;
    await instance.revokeRole(GLOBAL_ADMINISTRATOR_ROLE, address);
    expect(await instance.hasRole(GLOBAL_ADMINISTRATOR_ROLE, address)).is.false;
  });

  it("should contract support EIP165 interface", async function () {
    const instance = this.management.connect(this.signers.admin);

    expect(await instance.supportsInterface("0x01ffc9a7")).is.true;
  });

  it("should admin account transfer ownership to other account", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.second.address;
    await instance.transferOwnership(address);

    expect(await instance.owner()).to.equal(address);
  });

  it("should verify action signature", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.admin.address;
    const domain: TypedDataDomain = { ...defaultDomain, verifyingContract: instance.address };
    const message: MetaSpaceManagement.ActionStruct = { initiator: address, name: "Reboot production server" };
    const signature = await this.signers.admin._signTypedData(domain, actionTypes, message);
    await instance.grantRole(GLOBAL_ADMINISTRATOR_ROLE, address);

    expect(await instance["verifySignature((address,string),bytes)"](message, signature)).is.true;
  });

  it("should verify authorization signature", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.admin.address;
    const domain: TypedDataDomain = { ...defaultDomain, verifyingContract: instance.address };
    const message: MetaSpaceManagement.AuthorizationStruct = { user: address, timestamp: BigNumber.from(Date.now()) };
    const signature = await this.signers.admin._signTypedData(domain, authorizationTypes, message);
    await instance.grantRole(GLOBAL_ADMINISTRATOR_ROLE, address);

    expect(await instance["verifySignature((address,uint256),bytes)"](message, signature)).is.true;
  });

  it("should verify verification signature", async function () {
    const instance = this.management.connect(this.signers.admin);
    const address = this.signers.admin.address;
    const domain: TypedDataDomain = { ...defaultDomain, verifyingContract: instance.address };
    const authMessage: MetaSpaceManagement.AuthorizationStruct = {
      user: address,
      timestamp: BigNumber.from(Date.now()),
    };
    const authSignature = await this.signers.admin._signTypedData(domain, authorizationTypes, authMessage);
    const split = splitSignature(authSignature);
    const message: MetaSpaceManagement.VerificationStruct = {
      ...authMessage,
      server: address,
      v: split.v,
      r: split.r,
      s: split.s,
    };
    const signature = await this.signers.admin._signTypedData(domain, verificationTypes, message);
    await instance.grantRole(GLOBAL_ADMINISTRATOR_ROLE, address);
    await instance.grantRole(VERIFICATION_PAYLOAD_AUTHOR_ROLE, address);

    expect(await instance["verifySignature((address,address,uint256,uint8,bytes32,bytes32),bytes)"](message, signature))
      .is.true;
  });
}
