const express = require('express');

const router = express.Router();

// storeController
const searchController = require('../controller/searchController');

// 굿즈 이름 검색
router.get('/goods/:goodsName/:order', searchController.getGoods);
// 스토어 이름 검색
router.get('/store/:storeName/:order', searchController.getStore);

module.exports = router;
