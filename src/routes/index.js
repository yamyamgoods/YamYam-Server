const express = require('express');

const router = express.Router();

// /user route
const user = require('./user');

// books route
// const book = require('./book');

// /user 경로의 요청
router.use('/user', user);

// /book 경로의 요청
// router.use('/book', book);

module.exports = router;
