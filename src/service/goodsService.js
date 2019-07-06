const moment = require('moment');
const goodsDao = require('../dao/goodsDao');
const userDao = require('../dao/userDao');
const storeDao = require('../dao/storeDao');
const goodsTransaction = require('../dao/goodsTransaction');
const errorResponseObject = require('../../config/errorResponseObject');
const { makeReviewTimeString } = require('../library/changeTimeString');
const { s3Location } = require('../../config/s3Config');

async function getBestGoods(userIdx, lastIndex) {
  const result = [];
  let goods;

  if (lastIndex == -1) {
    goods = await goodsDao.selectFirstBestGoods();
  } else {
    goods = await goodsDao.selectNextBestGoods(lastIndex);
  }

  const goodsLength = goods.length;
  for (let i = 0; i < goodsLength; i++) {
    const goodsIdx = goods[i].goods_idx;
    // 유저 즐겨찾기 flag 추가
    const user = await userDao.selectUserWithGoods(userIdx, goodsIdx);

    if (user.length === 0) {
      goods[i].scrap_flag = 0;
    } else {
      goods[i].scrap_flag = 1;
    }

    // 굿즈 이미지 추가
    const goodsImg = await goodsDao.selectGoodsImg(goodsIdx);
    // 굿즈 이미지 중 가장 첫 번째 이미지 사용
    goods[i].goods_img = s3Location + goodsImg[0].goods_img;

    result.push(goods[i]);
  }

  return result;
}

async function getBestReviews(userIdx, lastIndex) {
  const result = [];

  let reviews;

  if (lastIndex == -1) {
    reviews = await goodsDao.selectFirstBestReviews();
  } else {
    reviews = await goodsDao.selectNextBestReviews(lastIndex);
  }

  const reviewsLength = reviews.length;
  for (let i = 0; i < reviewsLength; i++) {
    const reviewIdx = reviews[i].goods_review_idx;

    if (!reviews[i].goods_review_photo_flag) { // 리뷰에 이미지가 없는 경우
      reviews[i].goods_review_img = [];
    } else { // 리뷰에 이미지가 있는 경우
      const imgObjArr = await goodsDao.selectReviewImg(reviewIdx);

      // Mysql로부터 얻은 이미지 데이터 배열로 변경
      const imgObjArrLength = imgObjArr.length;
      const imgResultArray = [];
      for (let j = 0; j < imgObjArrLength; j++) {
        imgResultArray.push(s3Location + imgObjArr[j].goods_review_img);
      }

      reviews[i].goods_review_img = imgResultArray;
    }

    // 작성시간 String 수정
    reviews[i].goods_review_date = makeReviewTimeString(reviews[i].goods_review_date);

    // 댓글 좋아요 여부
    const reviewLike = await goodsDao.getReviewLike(userIdx, reviews[i].goods_review_idx);

    if (reviewLike.length != 0) {
      reviews[i].review_like_flag = 1;
    } else {
      reviews[i].review_like_flag = 0;
    }

    result.push(reviews[i]);
  }

  return result;
}

async function addReviewLike(userIdx, reviewIdx) {
  await goodsDao.insertReviewLike(userIdx, reviewIdx);
}

async function removeReviewLike(userIdx, reviewIdx) {
  await goodsDao.deleteReviewLike(userIdx, reviewIdx);
}

async function addGoodsScrap(userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel, options) {
  if (!options) { // 견적 옵션이 없는 경우
    await goodsDao.insertGoodsScrap(userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel);
  } else {
    // 견적 옵션이 있는 경우

    // 이미 견적이 있는 경우
    const allOptions = await goodsDao.getAllGoodsScrapOption(userIdx, goodsIdx);
    const allOptionsLength = allOptions.length;

    for (let i = 0; i < allOptionsLength; i++) {
      if (options == allOptions[i].goods_scrap_options) {
        throw errorResponseObject.duplicateDataError;
      }
    }

    await goodsTransaction.insertGoodsScrapTransaction(userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel, options);
  }
}

async function removeGoodsScrap(userIdx, goodsIdx, scrapIdx) {
  if (!scrapIdx) { // scrapIdx가 없는 경우 : 굿즈 탭에서 찜해제
    await goodsDao.deleteGoodsScrap(userIdx, goodsIdx);
  } else {
    // 찜탭에서 찜해제
    await goodsDao.deleteGoodsScrapByscrapIdx(scrapIdx);
  }
}

// 굿즈탭 보기 (위에 카테고리랑 아래 기획전 및 관련 굿즈들)
async function getGoodsTab() {
  const result = [];

  const subResult = {};

  const categoryData = [];
  const exhibitionData = [];

  const goodsCategory = await goodsDao.selectGoodsCategory();
  const goodsCategoryLength = goodsCategory.length;
  for (let i = 0; i < goodsCategoryLength; i++) {
    categoryData.push(goodsCategory[i]);
  }

  subResult.goods_category_data = categoryData;

  const exhibition = await goodsDao.selectExhibition();
  const exhibitionGoods = await goodsDao.selectExhibitionGoods();

  const exhibitLength = exhibition.length; // exhibition_idx 를 위함
  const exhibitGoodsLength = exhibitionGoods.length;


  for (let i = 0; i < exhibitLength; i++) {
    // 첫화면에서 해당 기획전의 굿즈를 안보여주길래 우선 뺌

    // const exhibitionIdx = exhibition[i].exhibition_idx;
    // exhibition[i].goods_data = [];
    // for (let k = 0; k < exhibitGoodsLength; k++) {
    //   if (exhibitionIdx == exhibitionGoods[k].exhibition_idx) {
    //     exhibition[i].goods_data.push(exhibitionGoods[k]);
    //   }
    // }
    exhibitionData.push(exhibition[i]);
  }

  subResult.exhibition_data = exhibitionData;

  result.push(subResult);

  return result;
}

// 굿즈카테고리 페이지네이션
async function getGoodsCategoryPagination(lastIndex) { // 굿즈카테고리 인덱스가 라스트 인덱스로
  const result = [];
  const goodsCategoryData = await goodsDao.selectGoodsCategoryPaging(lastIndex);
  const goodsCategoryLength = goodsCategoryData.length;

  for (let i = 0; i < goodsCategoryLength; i++) {
    result.push(goodsCategoryData[i]);
  }

  return result;
}

// 기획전 페이지네이션
async function getExhibitionPagination(lastIndex) {
  const result = [];
  const exhibitionData = await goodsDao.selectExhibitionPaging(lastIndex);
  const exhibitionDataLength = exhibitionData.length;

  for (let i = 0; i < exhibitionDataLength; i++) {
    result.push(exhibitionData[i]);
  }
  return result;
}

// 기획전 굿즈 모두보기
async function getExhibitionGoodsAll(userIdx, exhibitionIdx, lastIndex) {
  const result = [];
  const exhibitionGoodsAll = await goodsDao.selectExhibitionGoodsAll(exhibitionIdx, lastIndex);
  const exhibitionGoodsAllLength = exhibitionGoodsAll.length;

  for (let i = 0; i < exhibitionGoodsAllLength; i++) {
    const goodsIdx = exhibitionGoodsAll[i].goods_idx;
    const goodsStoreIdx = exhibitionGoodsAll[i].store_idx;
    const user = await userDao.selectUserWithGoods(userIdx, goodsIdx);

    // 해당 굿즈의 스토어 이름 추가
    const storeName = await storeDao.selectStoreName(goodsStoreIdx);
    exhibitionGoodsAll[i].store_name = storeName[0].store_name;

    // 유저 즐겨찾기 flag 추가
    if (user.length === 0) {
      exhibitionGoodsAll[i].scrap_flag = 0;
    } else {
      exhibitionGoodsAll[i].scrap_flag = 1;
    }

    // 굿즈이미지 한개 골라서 추가
    const goodsImg = await goodsDao.selectGoodsImg(goodsIdx);
    exhibitionGoodsAll[i].goods_img = s3Location + goodsImg[0].goods_img;

    result.push(exhibitionGoodsAll[i]);
  }
  return result;
}

async function getReviewDetail(reviewIdx) {
  const result = [];
  const returnObj = {};

  const goodsIdxArr = await goodsDao.selectGoodsIdxByReviewIdx(reviewIdx);
  const goodsIdx = goodsIdxArr[0].goods_idx;
  const goods = await goodsDao.selectGoods(goodsIdx);
  const goodsImg = await goodsDao.selectGoodsImg(goodsIdx);

  // 굿즈 데이터
  returnObj.goods = {
    goods_idx: goods[0].goods_idx,
    goods_img: s3Location + goodsImg[0].goods_img,
    goods_name: goods[0].goods_name,
    goods_price: goods[0].goods_price,
    goods_rating: goods[0].goods_rating,
    store_name: goods[0].store_name,
  };

  const reviewComment = await goodsDao.selectFirstReviewComments(reviewIdx);

  const reviewCommentLength = reviewComment.length;
  for (let i = 0; i < reviewCommentLength; i++) {
    // 유저 정보 가져오기
    const userArr = await userDao.selectUser(reviewComment[i].user_idx);
    const user = userArr[0];

    reviewComment[i].user_name = user.user_name;
    reviewComment[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    reviewComment[i]
      .goods_review_cmt_date = makeReviewTimeString(reviewComment[i].goods_review_cmt_date);
  }

  // 리뷰 댓글
  returnObj.review_comment = reviewComment;

  result.push(returnObj);

  return result;
}

async function getReviewComment(reviewIdx, lastIndex) {
  let reviewComment;

  if (lastIndex == -1) {
    reviewComment = await goodsDao.selectFirstReviewComments(reviewIdx);
  } else {
    reviewComment = await goodsDao.selectNextReviewComments(reviewIdx, lastIndex);
  }

  const reviewCommentLength = reviewComment.length;
  for (let i = 0; i < reviewCommentLength; i++) {
    // 유저 정보 가져오기
    const userArr = await userDao.selectUser(reviewComment[i].user_idx);
    const user = userArr[0];

    reviewComment[i].user_name = user.user_name;
    reviewComment[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    reviewComment[i]
      .goods_review_cmt_date = makeReviewTimeString(reviewComment[i].goods_review_cmt_date);
  }

  return reviewComment;
}

async function addReviewComment(userIdx, reviewIdx, content, recommentFlag) {
  if (!recommentFlag) {
    await goodsDao.insertReviewComment(userIdx, reviewIdx, content);
  } else {
    await goodsDao.insertReviewRecomment(userIdx, reviewIdx, content, 1);
  }
}
// 해당 굿즈의 리뷰 모두 가져오기

async function getGoodsReviews(goodsIdx, photoFlag, lastIndex) {
  let goodsReview;

  if (photoFlag == 1) {
    if (lastIndex == -1) {
      goodsReview = await goodsDao.selectFirstGoodsReviews(goodsIdx, photoFlag);
    } else {
      goodsReview = await goodsDao.selectNextGoodsReviews(goodsIdx, photoFlag, lastIndex);
    }
  } else if (photoFlag == -1) {
    if (lastIndex == -1) {
      goodsReview = await goodsDao.selectFirstGoodsReviewsAll(goodsIdx);
    } else {
      goodsReview = await goodsDao.selectNextGoodsReviewsAll(goodsIdx, lastIndex);
    }
  }

  const goodsReviewLength = goodsReview.length;

  for (let i = 0; i < goodsReviewLength; i++) {
    // 유저 정보 가져오기
    const userArr = await userDao.selectUser(goodsReview[i].user_idx);
    const user = userArr[0];
    const goodsReviewIdx = goodsReview[i].goods_review_idx;
    const goodsReviewImg = await goodsDao.selectReviewImg(goodsReviewIdx);

    // Mysql로부터 얻은 이미지 데이터 배열로 변경
    const imgObjArrLength = goodsReviewImg.length;
    const imgResultArray = [];
    for (let j = 0; j < imgObjArrLength; j++) {
      imgResultArray.push(s3Location + goodsReviewImg[j].goods_review_img);
    }
    goodsReview[i].user_name = user.user_name;
    goodsReview[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    goodsReview[i]
      .goods_review_date = makeReviewTimeString(goodsReview[i].goods_review_date);

    goodsReview[i].goods_review_img = imgResultArray;
  }

  return goodsReview;
}

async function modifyReviewComment(userIdx, commentIdx, contents) {
  const commentUserIdxArr = await userDao.selectUserIdxByCommentIdx(commentIdx);
  const commentUserIdx = commentUserIdxArr[0].user_idx;

  if (userIdx != commentUserIdx) {
    throw errorResponseObject.accessDinedError;
  }

  await goodsDao.updateReviewComment(commentIdx, contents);
}

async function removeReviewComment(userIdx, commentIdx) {
  const commentUserIdxArr = await userDao.selectUserIdxByCommentIdx(commentIdx);
  const commentUserIdx = commentUserIdxArr[0].user_idx;

  if (userIdx != commentUserIdx) {
    throw errorResponseObject.accessDinedError;
  }

  await goodsDao.deleteReviewComment(commentIdx);
}

async function getGoodsOptionsName(goodsIdx) {
  const result = await goodsDao.selectGoodsOptionsName(goodsIdx);

  return result;
}

async function getGoodsDetail(userIdx, goodsIdx) {
  // 최근 본 굿즈 추가
  if (userIdx != undefined) {
    const userRecentGoodsArr = await goodsDao.selectUserRecentGoods(userIdx, goodsIdx);

    if (userRecentGoodsArr.length == 0) {
      await goodsDao.insertUserRecentGoods(userIdx, goodsIdx);
    } else {
      await goodsDao.updateUserRecentGoods(userIdx, goodsIdx, moment().format('YYYY-MM-DD HH:mm:ss'));
    }
  }

  const goodsArr = await goodsDao.selectGoods(goodsIdx);

  // 굿즈 데이터
  const goods = {
    goods_name: goodsArr[0].goods_name,
    store_name: goodsArr[0].store_name,
    store_rating: goodsArr[0].store_rating,
    goods_price: goodsArr[0].goods_price,
    goods_delivery_charge: goodsArr[0].goods_delivery_charge,
    goods_delivery_period: goodsArr[0].goods_delivery_period,
    goods_minimum_amount: goodsArr[0].goods_minimum_amount,
    goods_detail: goodsArr[0].goods_detail,
  };

  // 유저 즐겨찾기 flag 추가
  const user = await userDao.selectUserWithGoods(userIdx, goodsIdx);

  if (user.length === 0) {
    goods.scrap_flag = 0;
  } else {
    goods.scrap_flag = 1;
  }

  // 굿즈 이미지 추가
  const goodsImgArr = await goodsDao.selectGoodsImg(goodsIdx);
  const goodsImgArrLength = goodsImgArr.length;
  for (let i = 0; i < goodsImgArrLength; i++) {
    goodsImgArr[i] = s3Location + goodsImgArr[i].goods_img;
  }
  goods.goods_img = goodsImgArr;

  // 스토어 데이터
  const store = {
    store_url: goodsArr[0].store_url,
  };

  const reviewsArr = await goodsDao.selectFirstGoodsReviewsAll(goodsIdx);
  // 리뷰 데이터
  const reviews = [];

  const goodsReviewLength = reviewsArr.length;

  for (let i = 0; i < goodsReviewLength; i++) {
    // 유저 정보 가져오기
    const userArr = await userDao.selectUser(reviewsArr[i].user_idx);
    const user = userArr[0];
    const goodsReviewIdx = reviewsArr[i].goods_review_idx;
    const goodsReviewImg = await goodsDao.selectReviewImg(goodsReviewIdx);

    // Mysql로부터 얻은 이미지 데이터 배열로 변경
    const imgObjArrLength = goodsReviewImg.length;
    const imgResultArray = [];
    for (let j = 0; j < imgObjArrLength; j++) {
      imgResultArray.push(s3Location + goodsReviewImg[j].goods_review_img);
    }
    reviewsArr[i].user_name = user.user_name;
    reviewsArr[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    reviewsArr[i]
      .goods_review_date = makeReviewTimeString(reviewsArr[i].goods_review_date);

    reviewsArr[i].goods_review_img = imgResultArray;

    reviews.push(reviewsArr[i]);
  }

  return {
    goods,
    store,
    reviews,
  };
}

async function addGoods(goodsName, storeIdx, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, categoryIdx, files, options) {
  // store, category가 없는 경우
  const storeArr = await storeDao.selectStoreName(storeIdx);
  const categoryArr = await goodsDao.goodsCategoryByCategoryIdx(categoryIdx);

  if (storeArr.length == 0) throw errorResponseObject.noStoreDataError;
  if (categoryArr.length == 0) throw errorResponseObject.noCategoryDataError;

  // options parse
  const optionArr = JSON.parse(options).optionArr;

  // img
  const imgArr = [];
  const filesLength = files.length;
  for (let i = 0; i < filesLength; i++) {
    imgArr.push(files[i].location.split(s3Location)[1]);
  }

  await goodsTransaction.insertGoodsTransaction(goodsName, storeIdx, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, categoryIdx, imgArr, optionArr);
}

// 카테고리에 따른 굿즈 최소 최대 금액 (옵션 - 최소 수량)
async function getGoodsPriceRange(goodsCategoryIdx, minAmount) {
  // {'price_start':100, 'price_end':40000 }
  let priceRange = await goodsDao.selectPriceRange(goodsCategoryIdx, minAmount);
  [priceRange] = priceRange;

  return priceRange;
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
};
