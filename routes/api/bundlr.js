const express = require('express');
const router = express.Router();
const ethers = require('ethers');
require('dotenv').config();

let provider;

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'developement') {
  console.log('Development Build');
  provider = 'Development';
} else {
  console.log('Production Build');
  provider = 'Production';
}

router.get('/', async (req, res) => {
  try {
    res.json({ message: `get response from bundlr ${provider} server!` });
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

router.post('/', async (req, res) => {
  try {
    res.json({ message: 'post response from bundlr server!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('server error');
  }
});

module.exports = router;
