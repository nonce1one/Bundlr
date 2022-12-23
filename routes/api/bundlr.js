const express = require('express');
const router = express.Router();
const Bundlr = require('@bundlr-network/client');
const WebBundlr = require('@bundlr-network/client/build/web');
require('dotenv').config();

router.get('/', async (req, res) => {
  try {
    res.json({ message: 'get response from bundlr server!' });
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
