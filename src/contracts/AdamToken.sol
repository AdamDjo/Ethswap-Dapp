// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract AdamToken {
    // Token name
    string public name = "AdamToken";
    // Token Symbol
    string public symbol = "Adam";
    // Token total supply
    uint256 public totalSupply;
    // Token holders address
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply;
        balances[msg.sender] = _initialSupply;
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    function balanceOf(address _account) public view returns (uint256) {
        return balances[_account];
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function transferTo(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        uint256 senderBalance = balances[_from];
        require(
            senderBalance >= _amount,
            "ERC20: transfer amount exceeds balance"
        );

        unchecked {
            balances[_from] = senderBalance - _amount;
        }
        balances[_to] += _amount;

        emit Transfer(_from, _to, _amount);

        return true;
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        transferTo(msg.sender, _to, _amount);
        return true;
    }

    function approveFrom(
        address _owner,
        address _spender,
        uint256 _amount
    ) public returns (bool) {
        allowances[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
        return true;
    }

    function approve(address spender, uint256 amount) public returns (bool) {
        approveFrom(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) public returns (bool) {
        uint256 currentAllowance = allowances[_from][msg.sender];
        require(
            currentAllowance >= _amount,
            "ERC20: transfer amount exceeds allowance"
        );

        approveFrom(_from, msg.sender, currentAllowance - _amount);

        transferTo(_from, _to, _amount);

        return true;
    }
}
