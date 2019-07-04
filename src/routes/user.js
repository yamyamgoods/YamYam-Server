const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

// userController
const userController = require('../controller/userController');

// 나의 찜한 모든 굿즈
router.get('/scrap/:lastIndex', jwtCheck, userController.getGoodsScrap)

module.exports = router;
