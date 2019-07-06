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
    const refreshToken = req.headers.refreshtoken;
    const userIdx = getUserIdxFromJwt(refreshToken);

    const result = await userService.getNewToken(refreshToken, userIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getUserInfo(req, res) {
  try { 
    const userIdx = req.user.userIdx;
    const result = await userService.getUserInfo(userIdx);

    response('Success', result, res, 200);

  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getUserRecentGoods(req, res) {
  try { 
    const userIdx = req.user.userIdx;
    const lastIndex = req.params.lastIndex;

    const result = await userService.getUserRecentGoods(userIdx, lastIndex);

    response('Success', result, res, 200);

  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}


async function getUserAlarmList(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const lastIndex = req.params.lastIndex;
    const result = await userService.getUserAlarmList(userIdx, lastIndex);
    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getUserAlarmFlag(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const result = await userService.getUserAlarmFlag(userIdx);
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
  getUserInfo,
  getUserRecentGoods,
  getUserAlarmList,
  getUserAlarmFlag,
};
