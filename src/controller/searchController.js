const goodsService = require('../service/goodsService');
const storeService = require('../service/storeService');
const { getUserIdxFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');
const { addCacheResponse, addCacheResponseWithJwtCheck } = require('../redis/redis');

async function getGoods(req, res) {
  try {
    const userIdx = getUserIdxFromJwt(req.headers.authorization);
    const searchAfter = req.query.searchAfter;
    const goodsName = req.params.goodsName;
    const order = req.params.order;

    const result = await goodsService.getGoodsBySearch(userIdx, searchAfter, goodsName, order);

    addCacheResponse(req.headers.authorization, req.url, result);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);

    errorResponse(error.message, res, error.statusCode);
  }
}

async function getStore(req, res) {
  try {
    const userIdx = getUserIdxFromJwt(req.headers.authorization);
    const searchAfter = req.query.searchAfter;
    const goodsName = req.params.storeName;
    const order = req.params.order;

    const result = await storeService.getStoreBySearch(userIdx, searchAfter, goodsName, order);

    addCacheResponseWithJwtCheck(req.headers.authorization, req.url, result);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);

    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getGoods,
  getStore,
};
