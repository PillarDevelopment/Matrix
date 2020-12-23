# Matrix contracts

Implementation of the mlm-system "Matrix"

- Lang: Solidity v0.5.12

- Project framework: truffle ^5.1.44

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

