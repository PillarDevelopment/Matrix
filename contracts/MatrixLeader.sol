pragma solidity ^0.5.12;

import "./core/MatrixOwnable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IPriceController.sol";

contract MatrixLeader is MatrixOwnable {
    using SafeMath for uint256;

    uint256[10] public parts = [30, 20, 10, 10, 5, 5, 5, 5, 5, 5];

    IPriceController public controller;
    uint256 public previousDate;
    uint256 public timeLimit;

    constructor(IPriceController _controller, uint256 _previousDate)
        public
        payable
    {
        controller = _controller;
        previousDate = _previousDate;
        timeLimit = 7 days;
    }

    function() external payable {}

    function setTimeLimit(uint256 newTimeLimit) public onlyOwner {
        timeLimit = newTimeLimit;
    }

    function transferRewards(
        address payable _one,
        address payable _two,
        address payable _three,
        address payable _four,
        address payable _five,
        address payable _six,
        address payable _seven,
        address payable _eight,
        address payable _nine,
        address payable _ten
    ) public payable onlyOwner {
        require(
            block.timestamp >= previousDate.add(timeLimit),
            "Incorrect time to withdraw"
        );
        uint256 _currentBalance =
            address(this).tokenBalance(controller.getTokenID());

        _one.transferToken(
            _currentBalance.mul(30).div(100),
            controller.getTokenID()
        );
        _two.transferToken(
            _currentBalance.mul(20).div(100),
            controller.getTokenID()
        );
        _three.transferToken(
            _currentBalance.mul(10).div(100),
            controller.getTokenID()
        );
        _four.transferToken(
            _currentBalance.mul(10).div(100),
            controller.getTokenID()
        );
        _five.transferToken(
            _currentBalance.mul(5).div(100),
            controller.getTokenID()
        );
        _six.transferToken(
            _currentBalance.mul(5).div(100),
            controller.getTokenID()
        );
        _seven.transferToken(
            _currentBalance.mul(5).div(100),
            controller.getTokenID()
        );
        _eight.transferToken(
            _currentBalance.mul(5).div(100),
            controller.getTokenID()
        );
        _nine.transferToken(
            _currentBalance.mul(5).div(100),
            controller.getTokenID()
        );
        _ten.transferToken(
            _currentBalance.mul(5).div(100),
            controller.getTokenID()
        );

        previousDate = block.timestamp;
    }

    function setPriceController(IPriceController _newController)
        public
        onlyOwner
    {
        controller = _newController;
    }

    function emergencyWithdraw(address payable custody)
        public
        payable
        onlyOwner
    {
        uint256 _currentBalance =
            address(this).tokenBalance(controller.getTokenID());
        custody.transferToken(_currentBalance, controller.getTokenID());
    }
}
