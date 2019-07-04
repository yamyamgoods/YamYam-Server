const express = require('express');

const router = express.Router();

const { jwtCheck } = require('../library/jwtCheck');

// goodsController
const goodsController = require('../controller/goodsController');

// best goods 가져오기
router.get('/best/:lastIndex', goodsController.getBestGoods);
// best review 가져오기
router.get('/reviews/best/:lastIndex', goodsController.getBestReviews);
// review 좋아요
router.post('/review/like', jwtCheck, goodsController.addReviewLike);
// review 좋아요 취소
router.delete('/review/:reviewIdx/like', jwtCheck, goodsController.removeReviewLike);
// 찜하기 (견적 options는 query)
router.post('/scrap', jwtCheck, goodsController.addGoodsScrap);
// 찜해제 (굿즈 탭)
router.delete('/:goodsIdx/scrap', jwtCheck, goodsController.removeGoodsScrap);
// 찜해제 (찜탭)
router.delete('/scrap/:scrapIdx', jwtCheck, goodsController.removeGoodsScrap);


module.exports = router;
