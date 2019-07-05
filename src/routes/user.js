const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

// userController
const userController = require('../controller/userController');

// 나의 찜한 모든 굿즈
router.get('/scrap/:lastIndex', jwtCheck, userController.getGoodsScrap);
// 찜한 굿즈의 견적 정보
router.get('/scrap/:goodsScrapIdx/option', jwtCheck, userController.getUserScrapOption);
// JWT Token 만료시 새로운 JWT Token 조회
router.get('/jwttoken', userController.getNewJwtToken);

module.exports = router;
