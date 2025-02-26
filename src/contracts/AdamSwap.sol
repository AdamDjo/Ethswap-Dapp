// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
import "./AdamToken.sol";

contract AdamSwap {
    address public admin;
    string public name = "AdamSwap Exchange";
    AdamToken public token;
    uint rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(address account, address token, uint amount, uint rate);

    constructor(AdamToken _token) {
        admin = msg.sender;
        token = _token;
    }

    function buyToken() public payable {
        // Calculate the number of tokens to buy
        uint tokenAmount = msg.value * rate;

        // Require that JosephSwap contract has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);

        // Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);

        // Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellToken(uint _amount) public payable {
        // User can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // Calculate the amount of Ether to redeem
        uint etherAmount = _amount / rate;

        // Require that JosephSwap has enough Ether
        require(address(this).balance >= etherAmount);

        // Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        payable(msg.sender).transfer(etherAmount);

        // Emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}
