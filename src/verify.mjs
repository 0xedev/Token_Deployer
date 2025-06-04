import { ethers } from "ethers";
import axios from "axios";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "dotenv/config";
// Dynamically resolve the path to TokenFactory.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TOKEN_FACTORY_ABI = JSON.parse(
  readFileSync(join(__dirname, "TokenFactory.json"), "utf8")
).abi;

const provider = new ethers.JsonRpcProvider(process.env.VITE_RPC_URL);
const contract = new ethers.Contract(
  process.env.VITE_TOKEN_FACTORY_ADDRESS,
  TOKEN_FACTORY_ABI,
  provider
);

contract.on(
  "TokenCreated",
  async (tokenAddress, creator, name, initialSupply, imageURI, event) => {
    // Prepare verification data
    const sourceCode = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";


contract TokenCreator is ERC20, Ownable {
    string public imageURI;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address tokenOwner,
        string memory _imageURI
    ) ERC20(name, symbol)  Ownable(tokenOwner) {
        imageURI = _imageURI;
        _mint(tokenOwner, initialSupply * 10**decimals());
    }
}
    `; // Use your actual TokenCreator source code here

    const compilerVersion = "v0.8.28+commit.7893614a";
    const constructorArgs = ethers.AbiCoder.defaultAbiCoder()
      .encode(
        ["string", "string", "uint256", "address", "string"],
        [name, symbol, initialSupply, creator, imageURI]
      )
      .replace("0x", "");

    await axios.post("https://api.basescan.org/api", null, {
      params: {
        apikey: process.env.BASESCAN_API_KEY,
        module: "contract",
        action: "verifysourcecode",
        contractaddress: tokenAddress,
        sourceCode,
        contractname: "TokenCreator",
        compilerversion: compilerVersion,
        constructorArguements: constructorArgs,
        optimizationUsed: 0, // No optimization
        runs: 200,
        evmversion: "cancun", // Optional, if supported
      },
    });
  }
);
