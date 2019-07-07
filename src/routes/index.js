const express = require('express');

const router = express.Router();

// user route
const user = require('./user');
// goods route
const goods = require('./goods');
// store route
const store = require('./store');
// search route
const search = require('./search');

// user 경로의 요청
router.use('/user', user);

// goods 경로의 요청
router.use('/goods', goods);

// store 경로의 요청
router.use('/store', store);

// search 경로의 요청
router.use('/search', search);

module.exports = router;
