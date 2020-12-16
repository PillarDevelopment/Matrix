const Web3 = require("web3");
// Конфигурация
const NODE_URL = "https://mainnet.infura.io/v3/4d8ab2c4b3c644debd67cd383937337d";
const CONTRACT_ADDRESS = "0x10b32A8117589642e53ceFD8527452d68c237173";

ABI = [{"inputs":[{"internalType":"address","name":"_logic","type":"address"},{"internalType":"address","name":"_admin","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}]

const web3 = new Web3(new Web3.providers.HttpProvider(NODE_URL));
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

contract.methods.implementation().call({from: "0xC646CE7E241C925dC59576e12EbA58c1D3E59983"})
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    })

// web3.eth.getStorageAt(CONTRACT_ADDRESS, "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103")
//     .then((res) => {
//         console.log(res);
//     })