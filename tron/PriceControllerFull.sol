
// File: contracts/core/MatrixOwnable.sol

pragma solidity ^0.5.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
contract MatrixOwnable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor () internal {
        address msgSender = msg.sender;
        _owner = msgSender;
        emit OwnershipTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Returns true if the caller is the current owner.
     */
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }
}

// File: contracts/interfaces/IPriceController.sol

pragma solidity ^0.5.12;

interface IPriceController {

    function setPriceProvider(address _newPriceProvider) external;
    
    function updateUsdRate(uint256 _newRate) external;

    function getCurrentUsdRate() external view returns(uint256);

    function getTokenID() external view returns(trcToken);

}

// File: contracts/PriceController.sol

pragma solidity ^0.5.12;




contract PriceController is IPriceController, MatrixOwnable {

    trcToken private tokenID = 1000495;

    address public priceProvider;

    uint256 private currentUsdRate;

    modifier onlyPriceProvider() {
        require(msg.sender == priceProvider, "PriceProvider: caller is not the priceProvider");
        _;
    }

    constructor() public {
        priceProvider = msg.sender;
    }

    function setPriceProvider(address _newPriceProvider) external onlyOwner {
        priceProvider = _newPriceProvider;
    }

    function updateUsdRate(uint256 _newRate) external onlyPriceProvider {
        currentUsdRate = _newRate;
    }


    function getCurrentUsdRate() external view returns(uint256) {
        return currentUsdRate;
    }

    function getTokenID() public view returns(trcToken) {
        return tokenID;
    }

}
