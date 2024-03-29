// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourERC20Token is ERC20, ERC20Permit, Ownable {
    constructor(address initialOwner)
        ERC20("GeoLogixToken", "GT")
        ERC20Permit("GeoLogixToken")
        Ownable(initialOwner)
    {
        _mint(msg.sender, 100000 * 10 ** decimals());
    }
}