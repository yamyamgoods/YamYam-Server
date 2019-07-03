const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

// goodsController
const goodsController = require('../controller/goodsController');

router.get('/best/:lastIndex', goodsController.getBestGoods);

module.exports = router;
