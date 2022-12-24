const asyncHandler = require('express-async-handler');
const ethers = require('ethers');
require('dotenv').config();

const contractAddress = process.env.TEST_CONTRACT_ADDRESS;
const ABI = require('./ABI/abi.json');
const abi = ABI.abi;

const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');
const signer = new ethers.Wallet(process.env.TEST_PRIVATE_KEY_2);
signer.getAddress().then((res) => console.log(`signer: ${res}`));
const signerConnected = signer.connect(provider);
const Signer = provider.getSigner();
Signer.getAddress().then((res) => console.log(`Signer: ${res}`));
console.log(Signer);
const oldContract = new ethers.Contract(contractAddress, abi, Signer);
const contract = oldContract.connect(signerConnected);

//@desc log address of user
//@route mint
//@Public
const addressUser = asyncHandler(async (req, res) => {
  const { address, tokenURI } = req.body;

  if (!address || !tokenURI) {
    res.status(400);
    throw new Error('please include all fields');
  }

  let tx = await contract.safeMint(address, tokenURI);

  let result = await provider.waitForTransaction(tx.hash, 1, 180000);

  res.send(result);
});

module.exports = addressUser;
