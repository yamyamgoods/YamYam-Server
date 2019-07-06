const goodsService = require('../service/goodsService');
const { getUserIdxFromJwt } = require('../library/jwtCheck');
const { response, errorResponse } = require('../library/response');

async function getBestGoods(req, res) {
  try {
    const { lastIndex } = req.params;

    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    const result = await goodsService.getBestGoods(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getBestReviews(req, res) {
  try {
    const { lastIndex } = req.params;

    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    const result = await goodsService.getBestReviews(userIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addReviewLike(req, res) {
  try {
    const { userIdx } = req.user;
    const { reviewIdx } = req.body;

    await goodsService.addReviewLike(userIdx, reviewIdx);

    response('Success', null, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeReviewLike(req, res) {
  try {
    const { userIdx } = req.user;
    const { reviewIdx } = req.params;

    await goodsService.removeReviewLike(userIdx, reviewIdx);

    response('Success', null, res, 204);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addGoodsScrap(req, res) {
  try {
    const { userIdx } = req.user;
    const { goodsIdx, goodsScrapLabel, goodsScrapPrice } = req.body;

    // JSON -> String 변환 후 저장
    const options = JSON.stringify(req.body.options);

    await goodsService.addGoodsScrap(userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel, options);

    response('Success', null, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeGoodsScrap(req, res) {
  try {
    const { userIdx } = req.user;
    const { goodsIdx, scrapIdx } = req.params;

    await goodsService.removeGoodsScrap(userIdx, goodsIdx, scrapIdx);

    response('Success', null, res, 204);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// 굿즈탭 보기 (위에 카테고리랑 아래 기획전 및 관련 굿즈들)
async function getGoodsTab(req, res) {
  try {
    const result = await goodsService.getGoodsTab();

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// 굿즈카테고리 페이지네이션
async function getGoodsCategoryPagination(req, res) {
  try {
    const goodsCategoryIdx = req.params.lastIndex;

    const result = await goodsService.getGoodsCategoryPagination(goodsCategoryIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

// 기획전 페이지네이션
async function getExhibitionPagination(req, res) {
  try {
    const exhibitionIdx = req.params.lastIndex;

    const result = await goodsService.getExhibitionPagination(exhibitionIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}


async function getExhibitionGoodsAll(req, res) {
  try {
    const { exhibitionIdx } = req.params;
    const goodsIdx = req.params.lastIndex;
    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    const result = await goodsService.getExhibitionGoodsAll(userIdx, exhibitionIdx, goodsIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getReviewDetail(req, res) {
  try {
    const { reviewIdx } = req.params;

    const result = await goodsService.getReviewDetail(reviewIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getReviewComment(req, res) {
  try {
    const { reviewIdx, lastIndex } = req.params;

    const result = await goodsService.getReviewComment(reviewIdx, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getGoodsReviews(req, res) {
  try {
    const { goodsIdx, lastIndex, photoFlag } = req.params;

    const result = await goodsService.getGoodsReviews(goodsIdx, photoFlag, lastIndex);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getGoodsPriceRange(req, res) {
  try {
    const { goodsCategoryIdx } = req.params;
    const { minAmount } = req.query;

    const result = await goodsService.getGoodsPriceRange(goodsCategoryIdx, minAmount);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getBestGoods,
  getBestReviews,
  addReviewLike,
  removeReviewLike,
  addGoodsScrap,
  removeGoodsScrap,
  getGoodsTab,
  getGoodsCategoryPagination,
  getExhibitionPagination,
  getExhibitionGoodsAll,
  getReviewDetail,
  getReviewComment,
  getGoodsReviews,
  getGoodsPriceRange,
};
