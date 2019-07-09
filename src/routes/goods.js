const express = require('express');

const router = express.Router();

const { jwtCheck, adminCheck } = require('../library/jwtCheck');

const upload = require('../library/s3Bucket').getMulter('goods');

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
router.delete('/review/:reviewIdx/comment/:commentIdx', jwtCheck, goodsController.removeReviewComment);
// 리뷰 작성 페이지
router.get('/:goodsIdx/options/name', goodsController.getGoodsOptionsName);
// 굿즈 상세보기
router.get('/:goodsIdx/detail', goodsController.getGoodsDetail);
// 굿즈 등록
router.post('/', adminCheck, upload.array('img'), goodsController.addGoods);
// 가격 범위 보기
router.get('/category/:goodsCategoryIdx/priceRange', goodsController.getGoodsPriceRange);
// 카테고리에 따른 굿즈 모두보기
router.get('/category/:goodsCategoryIdx/:order/:lastIndex', goodsController.getAllGoods);
// 견적 옵션
router.get('/:goodsIdx/options', goodsController.getGoodsOption);
// 찜수정하기
router.put('/scrap', jwtCheck, goodsController.addGoodsScrap);
// 카테고리의 하위 옵션 보기
router.get('/category/:goodsCategoryIdx/options', goodsController.getCategoryOption);
// 카테고리 등록
router.post('/category', adminCheck, goodsController.addCategory);
// 카테고리 옵션 등록
router.post('/category/option', adminCheck, goodsController.addCategoryOption);
// 리뷰 등록
router.post('/review', jwtCheck, upload.array('img'), goodsController.addReview);
// 리뷰 수정
router.put('/review', jwtCheck, upload.array('img'), goodsController.editReview);
// 리뷰 삭제
router.delete('/:goodsIdx/review/:reviewIdx', jwtCheck, goodsController.removeReview);

module.exports = router;
