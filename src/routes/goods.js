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
// 굿즈탭
router.get('/', goodsController.getGoodsTab);
// 굿즈 카테고리 페이지네이션
router.get('/category/:lastIndex', goodsController.getGoodsCategoryPagination);
// 기획전 페이지네이션
router.get('/exhibition/:lastIndex', goodsController.getExhibitionPagination);
// 기획전 굿즈 모두보기
router.get('/exhibition/:exhibitionIdx/:lastIndex', goodsController.getExhibitionGoodsAll);
// 리뷰 상세보기 뷰
router.get('/review/:reviewIdx/detail', goodsController.getReviewDetail);
// 리뷰의 댓글 더보기
router.get('/review/:reviewIdx/comment/:lastIndex', goodsController.getReviewComment)
// 댓글 작성하기
router.post('/review/comment', jwtCheck, goodsController.addReviewComment);
// 리뷰 보기
router.get('/:goodsIdx/reviews/:photoFlag/:lastIndex', goodsController.getGoodsReviews);
// 댓글 수정하기
router.put('/review/comment', jwtCheck, goodsController.modifyReviewComment);
// 댓글 삭제하기
router.delete('/review/comment/:commentIdx', jwtCheck, goodsController.removeReviewComment);

module.exports = router;
