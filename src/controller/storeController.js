const storeService = require('../service/storeService');
const { getUserIdxFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

// store 랭킹 가져오기
async function getStoreRank(req, res) {
  try {
    const lastIndex = req.params.lastIndex;
    const storeCategoryIdx = req.query.storeCategoryIdx;
    let userIdx;

    if (req.headers.authorization) {
      userIdx = getUserIdxFromJwt(req.headers.authorization);
    } else {
      userIdx = 0;
    }

    const result = await storeService.getStoreRank(userIdx, lastIndex, storeCategoryIdx);

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
    const storeCategoryIdx = req.query.storeCategoryIdx;
    const userIdx = req.user.userIdx;

    const result = await storeService.getStoreScrap(userIdx, lastIndex, storeCategoryIdx);

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

    response('Success', [], res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// store 즐겨찾기 삭제
async function removeStoreScrap(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const storeIdx = req.params.storeIdx;

    await storeService.removeStoreScrap(storeIdx, userIdx);

    response('Success', [], res, 203);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// store의 굿즈 카테고리 보기
async function getStoreGoodsCategory(req, res) {
  try {
    const storeIdx = req.params.storeIdx;

    const result = await storeService.getStoreGoodsCategory(storeIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// store 카테고리 보기
async function getStoreCategory(req, res) {
  try {
    const result = await storeService.getStoreCategory();

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// store 굿즈 보기
async function getStoreGoods(req, res) {
  try {
    const storeIdx = req.params.storeIdx;
    const order = req.params.order;
    const lastIndex = req.params.lastIndex;

    const goodsCategoryIdx = req.query.goodsCategoryIdx;

    let userIdx;
    if (req.headers.authorization) {
      userIdx = getUserIdxFromJwt(req.headers.authorization);
    }

    const result = await storeService.getStoreGoods(userIdx, storeIdx, order, lastIndex, goodsCategoryIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getStoreRank,
  getStoreScrap,
  addStoreScrap,
  removeStoreScrap,
  getStoreGoodsCategory,
  getStoreCategory,
  getStoreGoods,
};
