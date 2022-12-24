const express = require('express');
const router = express.Router();
const addressUser = require('../controllers/mintController');

let provider;

router.post('/', addressUser);

module.exports = router;
