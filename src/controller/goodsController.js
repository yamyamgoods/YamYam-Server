const goodsService = require('../service/goodsService');
const { verify } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

async function getBestGoods(req, res) {
  try {
    const lastIndex = req.params.lastIndex;
    const userId = await verify(req.headers.jwttoken).userId;

    const result = await goodsService.getBestGoods(userId, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getBestGoods,
};
