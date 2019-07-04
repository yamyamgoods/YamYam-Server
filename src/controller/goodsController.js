const goodsService = require('../service/goodsService');
const { getUserIdFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

async function getBestGoods(req, res) {
  try {
    const lastIndex = req.params.lastIndex;

    const userId = getUserIdFromJwt(req.headers.authorization);

    const result = await goodsService.getBestGoods(userId, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getBestReviews(req, res) {
  try {
    const lastIndex = req.params.lastIndex;

    const userId = getUserIdFromJwt(req.headers.authorization);

    const result = await goodsService.getBestReviews(userId, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addReviewLike(req, res) {
  try {
    const userId = req.user.userId;
    const reviewIdx = req.body.reviewIdx;

    console.log(reviewIdx);

    await goodsService.addReviewLike(userId, reviewIdx);

    response('Success', null, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeReviewLike(req, res) {
  try {
    const userId = req.user.userId;
    const reviewIdx = req.params.reviewIdx;

    await goodsService.removeReviewLike(userId, reviewIdx);

    response('Success', null, res, 204);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addGoodsScrap(req, res) {
  try {
    const userId = req.user.userId;
    const goodsIdx = req.body.goodsIdx;
    const label = req.body.label;
    const goodsScrapPrice = req.body.goodsScrapPrice;

    // JSON -> String 변환 후 저장
    const options = JSON.stringify(req.body.options);

    await goodsService.addGoodsScrap(userId, goodsIdx, goodsScrapPrice, label, options);

    response('Success', null, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeGoodsScrap(req, res) {
  try {
    const userId = req.user.userId;
    const goodsIdx = req.params.goodsIdx;
    const scrapIdx = req.params.scrapIdx;

    await goodsService.removeGoodsScrap(userId, goodsIdx, scrapIdx);

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
