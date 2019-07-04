const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

// storeController
const storeController = require('../controller/storeController');

// store 랭킹 가져오기
router.get('/rank/:lastIndex', storeController.getStoreRank);

// 단골 store 가져오기
router.get('/scrap/:lastIndex', jwtCheck, storeController.getStoreScrap);

module.exports = router;
