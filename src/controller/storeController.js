const storeService = require('../service/storeService');
const { getUserIdxFromJwt, verify } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

// store 랭킹 가져오기
async function getStoreRank(req, res) {
  try {
    const lastIndex = req.params.lastIndex;
    let userIdx;

    
    if (req.headers.authorization) {
      if (verify(req.headers.authorization) == -1) {
        errorResponse('잘못된 토큰입니다.', res, 401);
      }
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

    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    const result = await storeService.getStoreScrap(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getStoreRank,
  getStoreScrap,
};
