const express = require('express');

const router = express.Router();

// user route
const user = require('./user');
// goods route
const goods = require('./goods');
// store route
const store = require('./store');

// user 경로의 요청
router.use('/user', user);

// goods 경로의 요청
router.use('/goods', goods);

// store 경로의 요청
router.use('/store', store);

module.exports = router;
