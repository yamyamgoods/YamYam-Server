const storeService = require('../service/storeService');
const { getUserIdxFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');
const { addCacheResponse } = require('../redis/redis');

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

    addCacheResponse(req.headers.authorization, req.url, result);

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

    response('Success', [], res, 200);
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

    addCacheResponse(req.headers.authorization, req.url, result);

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

    addCacheResponse(req.headers.authorization, req.url, result);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// store 굿즈 보기
async function getStoreGoods(req, res) {
  try {
    const { storeIdx, order, lastIndex } = req.params;

    const { goodsCategoryIdx, firstFlag } = req.query;

    let userIdx;
    if (req.headers.authorization) {
      userIdx = getUserIdxFromJwt(req.headers.authorization);
    }

    const result = await storeService.getStoreGoods(userIdx, storeIdx, order, lastIndex, goodsCategoryIdx, firstFlag);

    addCacheResponse(req.headers.authorization, req.url, result);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// store 등록
async function addStore(req, res) {
  try {
    const file = req.file;
    const name = req.body.name;
    const url = req.body.url;
    const hashTag = req.body.hashTag; // 배열
    const categoryName = req.body.categoryName;

    const result = await storeService.addStore(file, name, url, hashTag, categoryName);

    response('Success', result, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getWebInfo(req, res) {
  try {
    const result = await storeService.getWebInfo();
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
  addStore,
  getWebInfo,
};
