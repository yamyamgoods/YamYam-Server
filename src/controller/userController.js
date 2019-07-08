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

async function getAlarmReviewDetail(req, res) {
  try {
    const alarmIdx = req.params.alarmIdx;
    const reviewIdx = req.params.reviewIdx;

    const result = await userService.getAlarmReviewDetail(alarmIdx, reviewIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function kakaoSignin(req, res) {
  try {
    const accesstoken = req.headers.accesstoken;
    const devicetoken = req.body.devicetoken;

    const result = await userService.kakaoSignin(accesstoken, devicetoken);

    response('Success', result, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function modifyUserProfile(req, res) {
  try {
    const profileImg = req.file.location;

    const userIdx = req.user.userIdx;

    await userService.modifyUserProfile(profileImg, userIdx);

    response('Success', [], res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function modifyUserNickname(req, res) {

  try {
    const userName = req.body.userName;  
    const userIdx = req.user.userIdx;
 
    await userService.modifyUserNickname(userName, userIdx);

    response('Success', [], res, 201);
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
  getAlarmReviewDetail,
  kakaoSignin,
  modifyUserProfile,
  modifyUserNickname,
};
