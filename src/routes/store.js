const express = require('express');

const router = express.Router();

const { jwtCheck, adminCheck } = require('../library/jwtCheck');

const upload = require('../library/s3Bucket').getMulter('store');

const { getCacheResponse, getCacheResponseWithJwtCheck } = require('../redis/redis');

// storeController
const storeController = require('../controller/storeController');

// store 랭킹 가져오기
router.get('/rank/:lastIndex', getCacheResponseWithJwtCheck, storeController.getStoreRank);

// 단골 store 가져오기
router.get('/scrap/:lastIndex', jwtCheck, storeController.getStoreScrap);

// store 즐겨찾기 추가
router.post('/scrap', jwtCheck, storeController.addStoreScrap);

// store 즐겨찾기 삭제
router.delete('/scrap/:storeIdx', jwtCheck, storeController.removeStoreScrap);

// store 굿즈 카테고리 보기
router.get('/:storeIdx/category', getCacheResponse, storeController.getStoreGoodsCategory);

// store 카테고리 보기
router.get('/category', getCacheResponse, storeController.getStoreCategory);

// store 굿즈 보기
router.get('/:storeIdx/goods/:order/:lastIndex', getCacheResponse, storeController.getStoreGoods);

// store 등록
router.post('/', adminCheck, upload.single('img'), storeController.addStore);

// web용
router.get('/web', storeController.getWebInfo);

module.exports = router;
