pragma solidity ^0.5.12;

import "./core/MatrixOwnable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IPriceController.sol";

contract MatrixLeader is MatrixOwnable{
    using SafeMath for uint256;

    uint256[] public parts;

    IPriceController public controller;
    uint256 public previousDate;
    uint256 public timeLimit;

    constructor(IPriceController _controller, uint256 _previousDate) payable public {
        controller = _controller;
        previousDate = _previousDate;
        timeLimit = 7 days;
        parts.push(30);
        parts.push(20);
        parts.push(10);
        parts.push(10);
        parts.push(5);
        parts.push(5);
        parts.push(5);
        parts.push(5);
        parts.push(5);
        parts.push(5);
    }


    function() payable external {}


    function setTimeLimit(uint256 newTimeLimit) public onlyOwner {
        timeLimit = newTimeLimit;
    }


    function transferRewards(address payable[10] memory _pool) payable public onlyOwner {
        require(block.timestamp >= previousDate.add(timeLimit));
        uint256 _currentBalance = address(this).tokenBalance(controller.getTokenID());

        for (uint256 i = 0; i < _pool.length; i++) {
            _pool[i].transferToken(_currentBalance.mul(parts[i].div(100)), controller.getTokenID());
        }
        previousDate = block.timestamp;
    }


    function setPriceController(IPriceController _newController) public onlyOwner{
        controller = _newController;
    }


    function emergencyWithdraw(address payable custody) payable public onlyOwner {
        uint256 _currentBalance = address(this).tokenBalance(controller.getTokenID());
        custody.transferToken(_currentBalance, controller.getTokenID());
    }

}