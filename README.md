# Contract Template

[![Build](https://github.com/mechanizm/arbitrage-contracts/workflows/Truffle%20CI/badge.svg)](https://github.com/mechanizm/arbitrage-contracts/actions)

Implementation of proxies for trading strategies

## How it works
![useCase picture](./img/useCase.png)

Tokens must be on the balance of the ArbitrageProxy smart contract

## Interfaces and types
```
interface ArbitrageTypes {

    struct TradingStrategy {
        IArbitrageAdapter adapter;
        IERC20 fromToken;
        IERC20 toToken;
    }

}

interface IArbitrageAdapter {

    function swap(IERC20 fromToken, IERC20 toToken, uint256 amountIn) external returns (uint256);

    function approveForAdapter(IERC20 _token, uint256 value) external;

}

interface IArbitrageProxy {

    function run(uint _amount, ArbitrageTypes.TradingStrategy[] memory _strategy) external returns(uint resultAmount);

    function withdrawAllTokens(IERC20 withdrawalToken) external;

}

interface IArbitrageRoles {

    function changeExecutor(address _newExecutor) external;

    function getInvestor() external view returns(address);

    function getExecutor() external view returns(address);

}
```

## Method signatures
```
Sighash   |   Function Signature
========================
a5db6741  =>  run(uint256,ArbitrageTypes.TradingStrategy[])
aea73ec8  =>  withdrawAllTokens(IERC20)
9665b658  =>  changeExecutor(address)
796c8902  =>  getInvestor()
6c1032af  =>  getExecutor()
```

## Inheritance of contracts
![inheritance ArbitrageProxy](./img/inheritanceArbitrageProxy.png)
![inheritance ArbitrageAdapter](./img/inheritanceArbitrageAdapter.png)

Tokens must be on the balance of the ArbitrageProxy smart contract

## Installation & Usage

1) Require truffle
    ```
    npm i -g truffle
    ```

2) Install local packages
    ```
    npm i --save-dev
    ```

3) Build project:
    ```
    npm run build
    ```

4) Deploy contracts on ganache (port 7545):
    ```
    truffle migrate --network development
    ```

5) Deploy contracts on production (including testnets):

    edit in truffle-config.js:
    ```
        production: {
        provider: function() {
            return new HDWallet(privateKey, <NODE URL>);
        },
        network_id: <NETWORK ID>,
        production: true
        },
    ```
    and run
    ```
    export ETH_PRIVATE_KEY=<your private key>
    truffle migrate --network kovan
    ```

    or

    ```
    export ETH_PRIVATE_KEY=<your private key>
    truffle migrate --network production
    ```


## Testing
```
npm test
```

## Test coverage
```
npm run coverage
```

## Run linters
```
npm run lint
```
