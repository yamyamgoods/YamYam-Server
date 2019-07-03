const goodsService = require('../service/goodsService');
const { getUserIdFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

async function getBestGoods(req, res) {
  try {
    const lastIndex = req.params.lastIndex;

    const userId = await getUserIdFromJwt(req.headers.authorization);

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

    const result = await goodsService;
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getBestGoods,
};
