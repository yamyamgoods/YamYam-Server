const express = require('express');

const router = express.Router();

// /user route
const user = require('./user');

// /user 경로의 요청
router.use('/user', user);

module.exports = router;
