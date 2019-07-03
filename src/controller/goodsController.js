const goodsService = require('../service/goodsService');
const { response, errorResponse } = require('../library/response');

async function getBestGoods(req, res) {
  try {
    const lastIndex = req.params.lastIndex;
    //const userId = req.user.id;

    //const result = await goodsService.getBestGoods(userId, lastIndex);
    const result = await goodsService.getBestGoods(1, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getBestGoods,
};
