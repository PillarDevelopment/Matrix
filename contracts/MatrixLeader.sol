pragma solidity ^0.5.12;

import "./core/MatrixOwnable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IPriceController.sol";

contract MatrixLeader is MatrixOwnable{
    using SafeMath for uint256;

    address payable[] public leaders;
    uint256[] public parts;

    IPriceController public controller;
    uint256 public previousDate;
    uint256 public timeLimit;

    constructor(IPriceController _controller) public {
        controller = _controller;
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


    function setTimeLimit(uint256 newTimeLimit) public onlyOwner {
        timeLimit = newTimeLimit;
    }


    function transferRewards() payable public onlyOwner {
        require(block.timestamp >= previousDate.add(timeLimit));
        uint256 _currentBalance = address(this).tokenBalance(controller.getTokenID());

        for (uint256 i = 0; i < leaders.length; i++) {
            leaders[i].transferToken(_currentBalance.mul(parts[i].div(100)), controller.getTokenID());
        }
        previousDate = block.timestamp;
    }


    // метод записи пула лидеров
    function setLeaderPool(address payable[10] memory _pool) public onlyOwner {
        for(uint256 i = 0; i < 10; i++) {
            leaders.push(_pool[i]);
        }
    }


    function getLeader(uint256 id) public view returns(address) {
        return leaders[id];
    }


    function setLeader(address payable _leader, uint256 id) public onlyOwner {
        leaders[id] = _leader;
    }


    function setPriceController(IPriceController _newController) public onlyOwner{
        controller = _newController;
    }

}
