const express = require('express');

const router = express.Router();

// userController
const userController = require('../controller/userController');

// 유저페이지 조회
router.get('/:userId', userController.getUserPageInfo);


module.exports = router;
