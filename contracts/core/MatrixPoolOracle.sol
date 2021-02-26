pragma solidity ^0.5.0;

import "./MatrixOwnable.sol";

/**
 * @dev Pool oracle implementation
 */
contract MatrixPoolOracle is MatrixOwnable {
    address private _poolOracle;

    event PoolOracleTransferred(
        address indexed previousPoolOracle,
        address indexed newPoolOracle
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial pool oracle.
     */
    constructor() internal {
        address msgSender = msg.sender;
        _poolOracle = msgSender;
        emit PoolOracleTransferred(address(0), msgSender);
    }

    /**
     * @dev Returns the address of the current pool oracle.
     */
    function poolOracle() public view returns (address) {
        return _poolOracle;
    }

    /**
     * @dev Throws if called by any account other than the pool oracle.
     */
    modifier onlyPoolOracle() {
        require(isPoolOracle(), "Ownable: caller is not the pool oracle");
        _;
    }

    /**
     * @dev Returns true if the caller is the pool oracle.
     */
    function isPoolOracle() public view returns (bool) {
        return msg.sender == _poolOracle;
    }

    /**
     * @dev Transfers oracle role of the contract to a new account (`newPoolOracle`).
     * Can only be called by the current pool oracle.
     */
    function transferOracleRole(address newPoolOracle) public onlyOwner {
        _transferOracleRole(newPoolOracle);
    }

    /**
     * @dev Transfers oracle role of the contract to a new account (`newPoolOracle`).
     */
    function _transferOracleRole(address newPoolOracle) internal {
        require(
            newPoolOracle != address(0),
            "MatrixOracle: new oracle pool is the zero address"
        );
        emit PoolOracleTransferred(_poolOracle, newPoolOracle);
        _poolOracle = newPoolOracle;
    }
}
