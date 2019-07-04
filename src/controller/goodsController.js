const goodsService = require('../service/goodsService');
const { getUserIdxFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

async function getBestGoods(req, res) {
  try {
    const lastIndex = req.params.lastIndex;

    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    const result = await goodsService.getBestGoods(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getBestReviews(req, res) {
  try {
    const lastIndex = req.params.lastIndex;

    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    const result = await goodsService.getBestReviews(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addReviewLike(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const reviewIdx = req.body.reviewIdx;

    await goodsService.addReviewLike(userIdx, reviewIdx);

    response('Success', null, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeReviewLike(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const reviewIdx = req.params.reviewIdx;

    await goodsService.removeReviewLike(userIdx, reviewIdx);

    response('Success', null, res, 204);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addGoodsScrap(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const goodsIdx = req.body.goodsIdx;
    const goodsScrapLabel = req.body.goodsScrapLabel;
    const goodsScrapPrice = req.body.goodsScrapPrice;

    // JSON -> String 변환 후 저장
    const options = JSON.stringify(req.body.options);

    await goodsService.addGoodsScrap(userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel, options);

    response('Success', null, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeGoodsScrap(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const goodsIdx = req.params.goodsIdx;
    const scrapIdx = req.params.scrapIdx;

    await goodsService.removeGoodsScrap(userIdx, goodsIdx, scrapIdx);

    response('Success', null, res, 204);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getBestGoods,
  getBestReviews,
  addReviewLike,
  removeReviewLike,
  addGoodsScrap,
  removeGoodsScrap,
};
