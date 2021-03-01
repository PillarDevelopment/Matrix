# Matrix contracts
Mainnet
[PriceController](https://tronscan.io/#/contract/TS25NLQHdXnR2DvgfZXpM1ees7SwExU1yw/code)
[MatrixLeader](https://tronscan.io/#/contract/TUJAHqewqN5cJUapZXiKwD2iNpjjE6CUWx/code)
[MatrixOne](https://tronscan.io/#/contract/TLranSKiYiWsT9NdM1ywCQVMaagL5tpEp1/code)
[MatrixTwo](https://tronscan.io/#/contract/TMSa3gyq6UhYaBV6ocNjw5h1NXkbwDWqSn/code)
[MatrixThree](https://tronscan.io/#/contract/TLcpxSgnde2hPuJSFanjEnXpfeW9tVYdAN/code)
[MatrixFour](https://tronscan.io/#/contract/TLBa7ZV4CndwZMY187CAsszuGm6g35DtH3/code)


Implementation of the mlm-system "Matrix"

- Lang: Solidity v0.5.12

- Project framework: tronbox v2.7.17

## Project structure:
```
contracts/
├── core
│   ├── ILeaderPool.sol
│   ├── IMatrix.sol
│   ├── MatrixCore.sol
│   └── MatrixOwnable.sol
├── IPriceController.sol
├── MatrixFour.sol
├── MatrixOne.sol
├── MatrixThree.sol
├── MatrixTwo.sol
└── PriceController.sol
```

- __/core__ - Core of mlm system

- __Matrix\<Number\>.sol__ - Instance of a specific matrix

- __PriceController.sol__ - Registration cost controller contract

## Contract documentation

[link](./docs/index.md)

## Inheritance:

![useCase picture](./img/inheritance.png)

## Installation & Usage

Install packages
```
npm i --save-dev
```

### Build project:
```
npm run build
```

### Testing
```
npm test
```

### Test coverage
```
npm run coverage
```

### Run linters
```
npm run lint
```

For external networks use ENV "`PRIVATE_KEY`".

