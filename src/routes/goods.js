const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

// goodsController
const goodsController = require('../controller/goodsController');

// best goods 가져오기
router.get('/best/:lastIndex', goodsController.getBestGoods);
// best review 가져오기
router.get('/reviews/best/:lastIndex', goodsController.getBestReviews);

module.exports = router;
