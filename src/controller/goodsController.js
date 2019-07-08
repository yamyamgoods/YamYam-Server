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

async function addReviewComment(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const reviewIdx = req.body.reviewIdx;
    const contents = req.body.contents;
    const recommentFlag = req.body.recommentFlag;
    const userIdxForAlarm = req.body.userIdxForAlarm;

    await goodsService.addReviewComment(userIdx, userIdxForAlarm, reviewIdx, contents, recommentFlag);

    response('Success', [], res, 201);
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

async function modifyReviewComment(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const commentIdx = req.body.commentIdx;
    const contents = req.body.contents;

    await goodsService.modifyReviewComment(userIdx, commentIdx, contents);

    response('Success', [], res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function removeReviewComment(req, res) {
  try {
    const userIdx = req.user.userIdx;
    const commentIdx = req.params.commentIdx;
    const reviewIdx = req.params.reviewIdx;

    await goodsService.removeReviewComment(userIdx, reviewIdx, commentIdx);

    response('Success', [], res, 204);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getGoodsOptionsName(req, res) {
  try {
    const goodsIdx = req.params.goodsIdx;

    const result = await goodsService.getGoodsOptionsName(goodsIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getGoodsDetail(req, res) {
  try {
    const goodsIdx = req.params.goodsIdx;
    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    const result = await goodsService.getGoodsDetail(userIdx, goodsIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addGoods(req, res) {
  try {
    const goodsName = req.body.goodsName;
    const storeIdx = req.body.storeIdx;
    const price = req.body.price;
    const deliveryCharge = req.body.deliveryCharge;
    const deliveryPeriod = req.body.deliveryPeriod;
    const minimumAmount = req.body.minimumAmount;
    const detail = req.body.detail;
    const categoryIdx = req.body.categoryIdx;
    const goodsCategoryOptionIdx = req.body.goodsCategoryOptionIdx;

    const files = req.files;

    /* 옵션 데이터 예시 (JSON.parse 필요)
    [
          {
            "optionName" : "색상",
            "optionDetail" : [
              {
                "optionName": "빨강",
                "optionPrice": 1000
              },
              {
                "optionName": "파랑",
                "optionPrice": 2000
              }
            ]
          },
          {
            "optionName" : "사이즈",
            "optionDetail" : [
              {
                "optionName": "M",
                "optionPrice": 1000
              },
              {
                "optionName": "L",
                "optionPrice": 2000
              }
            ]
          }
      ]
     */
    const options = req.body.options;

    await goodsService.addGoods(goodsName, storeIdx, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, categoryIdx, files, options, goodsCategoryOptionIdx);

    response('Success', [], res, 201);
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

async function getAllGoods(req, res) {
  try {
    const { goodsCategoryIdx, order, lastIndex } = req.params;
    const {
      priceStart, priceEnd, minAmount, options,
    } = req.query;

    let userIdx;
    if (req.headers.authorization) {
      userIdx = getUserIdxFromJwt(req.headers.authorization);
    }

    const result = await goodsService.getAllGoods(goodsCategoryIdx, order, lastIndex, priceStart, priceEnd, minAmount, options, userIdx);

    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getGoodsOption(req, res) {
  try {
    const goodsIdx = req.params.goodsIdx;
    const result = await goodsService.getGoodsOption(goodsIdx);
    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function getCategoryOption(req, res) {
  try {
    const { categoryIdx } = req.params;
    const result = await goodsService.getCategoryOption(categoryIdx);
    response('Success', result, res, 200);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addCategory(req, res) {
  try {
    const categoryName = req.body.categoryName;

    const result = await goodsService.addCategory(categoryName);

    response('Success', result, res, 201);
  } catch (error) {
    console.log(error);
    errorResponse(error.message, res, error.statusCode);
  }
}

async function addCategoryOption(req, res) {
  try {
    const categoryId = req.body.categoryIdx;
    const categoryOption = req.body.categoryOption;

    const result = await goodsService.addCategoryOption(categoryId, categoryOption);

    response('Success', result, res, 201);
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
  addReviewComment,
  getGoodsReviews,
  modifyReviewComment,
  removeReviewComment,
  getGoodsOptionsName,
  getGoodsDetail,
  addGoods,
  getGoodsPriceRange,
  getAllGoods,
  getGoodsOption,
  getCategoryOption,
  addCategory,
  addCategoryOption,
};
