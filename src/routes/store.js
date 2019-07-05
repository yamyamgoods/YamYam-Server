const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

// storeController
const storeController = require('../controller/storeController');

// store 랭킹 가져오기
router.get('/rank/:lastIndex', storeController.getStoreRank);

// 단골 store 가져오기
router.get('/scrap/:lastIndex', jwtCheck, storeController.getStoreScrap);

// store 즐겨찾기 추가
router.post('/scrap', jwtCheck, storeController.addStoreScrap);

// store 즐겨찾기 삭제
router.delete('/scrap/:storeIdx', jwtCheck, storeController.removeStoreScrap);

// store 굿즈 카테고리 보기
router.get('/:storeIdx/category', storeController.getStoreGoodsCategory);

module.exports = router;
