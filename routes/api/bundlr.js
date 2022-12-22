const express = require('express');
const router = express.Router();
const Bundlr = require('@bundlr-network/client');
const dotenv = require('dotenv');

dotenv.config();

let serverBundlr;

async function serverInit() {
  const key = process.env.BUNDLR_PROVIDER; // your private key
  serverBundlr = new Bundlr('https://devnet.bundlr.network', 'ethereum', key);
  const presignedHash = serverBundlr.currencyConfig.sign(
    'sign this message to connect to Bundlr.Network'
  );
  return presignedHash; // transfer hash to the client
}

async function signDataOnServer(signatureData) {
  return await serverBundlr.currencyConfig.sign(signatureData);
}

router.get('/', async (req, res) => {
  try {
    res.json({ message: 'hello from bundlr server!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

module.exports = router;
