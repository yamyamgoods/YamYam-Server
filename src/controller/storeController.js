const storeService = require('../service/storeService');
const { getUserIdxFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

// store 랭킹 가져오기
async function getStoreRank(req, res) {
  try {
    const lastIndex = req.params.lastIndex;
    let userIdx;

    if (req.headers.authorization) {
      userIdx = getUserIdxFromJwt(req.headers.authorization);
    } else {
      userIdx = 0;
    }

    const result = await storeService.getStoreRank(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, 500);
  }
}

// 단골 store 가져오기
async function getStoreScrap(req, res) {
  try {
    const lastIndex = req.params.lastIndex;

    const userIdx = req.user.userIdx;

    const result = await storeService.getStoreScrap(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// store 즐겨찾기 추가
async function addStoreScrap(req, res) {
  // STORE_SCRAP 에 store_idx, user_idx
  try {
    const userIdx = req.user.userIdx;
    const storeIdx = req.body.storeIdx;

    await storeService.addStoreScrap(storeIdx, userIdx);

    response('Success', null, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getStoreRank,
  getStoreScrap,
  addStoreScrap,
};
