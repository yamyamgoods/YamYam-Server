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
// 마이페이지 보기
router.get('/mypage', jwtCheck, userController.getUserInfo);
// 최근 본 상품 보기
router.get('/goods/recent/:lastIndex', jwtCheck, userController.getUserRecentGoods);
// 알람 목록
router.get('/alarm/list/:lastIndex', jwtCheck, userController.getUserAlarmList);
// 알람 플래그 주기
router.get('/alarm/flag', jwtCheck, userController.getUserAlarmFlag);
// 알람 플래그 주기
router.get('/alarm/:alarmIdx/review/:reviewIdx', jwtCheck, userController.getAlarmReviewDetail);

module.exports = router;
