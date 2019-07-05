const userService = require('../service/userService');
const { getUserIdxFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

async function getGoodsScrap(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const lastIndex = req.params.lastIndex;

    const result = await userService.getGoodsScrap(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getUserScrapOption(req, res) {
  try {
    const goodsScrapIdx = req.params.goodsScrapIdx;

    const result = await userService.getUserScrapOption(goodsScrapIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getNewJwtToken(req, res) {
  try {
    const refreshToken = req.headers.refreshToken;
    const userIdx = getUserIdxFromJwt(refreshToken);

    const result = await userService.getNewToken(refreshToken, userIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getGoodsScrap,
  getUserScrapOption,
  getNewJwtToken,
};
