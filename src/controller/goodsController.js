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
    const userId = getUserIdFromJwt(req.headers.authorization);
    const reviewIdx = req.params.reviewIdx;

    await goodsService.addReviewLike(userId, reviewIdx);

    response('Success', null, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeReviewLike(req, res) {
  try {
    const userId = getUserIdFromJwt(req.headers.authorization);
    const reviewIdx = req.params.reviewIdx;

    await goodsService.removeReviewLike(userId, reviewIdx);

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
};
