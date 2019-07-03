const express = require('express');

const router = express.Router();

// user route
const user = require('./user');
// goods route
const goods = require('./goods');

// user 경로의 요청
router.use('/user', user);

// goods 경로의 요청
router.use('/goods', goods);

module.exports = router;
