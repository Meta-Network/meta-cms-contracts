import { task } from "hardhat/config";

type ContractArgument = {
  domainName: string;
  domainVersion: string;
};

task<ContractArgument>("deploy:manage", "Deploy MetaSpaceManagement contract")
  .addParam("domainName", "EIP712DomainSeparator name", "Meta Space Management")
  .addParam("domainVersion", "EIP712DomainSeparator version", "1")
  .setAction(async function (args: ContractArgument, { ethers }) {
    const factory = await ethers.getContractFactory("MetaSpaceManagement");
    const instance = await factory.deploy(args.domainName, args.domainVersion);
    await instance.deployed();
    console.log("MetaSpaceManagement deployed to: ", instance.address);
  });
