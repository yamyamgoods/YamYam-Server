const express = require('express');

const router = express.Router();

const { getCacheResponse } = require('../redis/redis');

// storeController
const searchController = require('../controller/searchController');

// 굿즈 이름 검색
router.get('/goods/:goodsName/:order', getCacheResponse, searchController.getGoods);
// 스토어 이름 검색
router.get('/store/:storeName/:order', getCacheResponse, searchController.getStore);

module.exports = router;
