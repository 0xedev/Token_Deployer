/**
 
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TokenCreator.sol";

contract TokenFactory is Ownable, ReentrancyGuard {
    uint256 public CREATION_FEE = 0.006 ether;
    
    event TokenCreated(address indexed tokenAddress, address indexed creator, string name, uint256 initialSupply, string imageURI);
    event CreationFeeUpdated(uint256 newFee);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        string memory imageURI
    ) external payable nonReentrant returns (address) {
        require(msg.value >= CREATION_FEE, "Insufficient creation fee");
        require(initialSupply > 0, "Initial supply must be greater than zero");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(symbol).length > 0, "Symbol cannot be empty");

        TokenCreator newToken = new TokenCreator(name, symbol, initialSupply, msg.sender, imageURI);

        address payable ownerAddress = payable(owner());
        require(ownerAddress != address(0), "Invalid owner address");
        (bool sent, ) = ownerAddress.call{value: msg.value}("");
        require(sent, "Failed to send fee");
        
        emit TokenCreated(address(newToken), msg.sender, name, initialSupply, imageURI);
        return address(newToken);
    }

    function withdrawFees() external nonReentrant onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Failed to withdraw fees");
        emit FeesWithdrawn(owner(), balance);
    }

    function updateCreationFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "Creation fee must be greater than zero");
        require(newFee <= 0.1 ether, "Creation fee too high");
        CREATION_FEE = newFee;
        emit CreationFeeUpdated(newFee);
    }

    receive() external payable {}
}


pragma solidity ^0.8.19;

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
 
 */