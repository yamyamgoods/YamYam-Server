const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

const upload = require('../library/s3Bucket').getMulter('user');    

// userController
const userController = require('../controller/userController');

// 나의 찜한 모든 굿즈
router.get('/goods/scrap/:lastIndex', jwtCheck, userController.getGoodsScrap);
// 찜한 굿즈의 견적 정보
router.get('/goods/scrap/:goodsScrapIdx/option', jwtCheck, userController.getUserScrapOption);
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
// 알람목록에서 리뷰상세보기
router.get('/alarm/:alarmIdx/review/:reviewIdx', jwtCheck, userController.getAlarmReviewDetail);
// 카카오 로그인
router.post('/signin/kakao', userController.kakaoSignin);
// 유저프로필 수정
router.put('/profile', upload.single('img'), jwtCheck, userController.modifyUserProfile);
// 유저이름 수정
router.put('/name', jwtCheck, userController.modifyUserNickname);

module.exports = router;
