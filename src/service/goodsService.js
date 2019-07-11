const moment = require('moment');
const goodsDao = require('../dao/goodsDao');
const userDao = require('../dao/userDao');
const storeDao = require('../dao/storeDao');
const elasticsearchGoods = require('../elasticsearch/goods');
const goodsTransaction = require('../dao/goodsTransaction');
const errorResponseObject = require('../../config/errorResponseObject');
const { makeReviewTimeString } = require('../library/changeTimeString');
const { s3Location } = require('../../config/s3Config');
const { addCommaIntoNum } = require('../library/addCommaIntoNum');

// 단일 키 객체 => 값 배열
function parseObj(dataArr, attr) {
  const res = [];

  for (let i = 0; i < dataArr.length; i++) {
    res.push(dataArr[i][attr]);
  }

  return res;
}

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
    reviews[i].user_img = s3Location + reviews[i].user_img;

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
    reviews[i].goods_review_date = moment(reviews[i].goods_review_date).format('YYYY.MM.DD');

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
  await goodsTransaction.insertReviewLikeTransaction(userIdx, reviewIdx);
}

async function removeReviewLike(userIdx, reviewIdx) {
  await goodsTransaction.deleteReviewLikeTransaction(userIdx, reviewIdx);
}

async function addGoodsScrap(userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel, options) {
  // 같은 라벨이 있는 경우
  const goodsScrapLabelArr = await goodsDao.selectGoodsScrapLabel(userIdx, goodsIdx);
  const goodsScrapLabelArrLength = goodsScrapLabelArr.length;
  for (let i = 0; i < goodsScrapLabelArrLength; i++) {
    if (goodsScrapLabel == goodsScrapLabelArr[i].goods_scrap_label) {
      throw errorResponseObject.duplicateLabelError;
    }
  }

  if (!options) { // 견적 옵션이 없는 경우
    await goodsDao.insertGoodsScrap(userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel);
  } else {
    // 견적 옵션이 있는 경우

    // 이미 견적이 있는 경우
    const allOptions = await goodsDao.getAllGoodsScrapOption(userIdx, goodsIdx);
    const allOptionsLength = allOptions.length;

    for (let i = 0; i < allOptionsLength; i++) {
      if (options == allOptions[i].goods_scrap_option) {
        throw errorResponseObject.duplicateScrapOptionError;
      }
    }

    const priceWithComma = addCommaIntoNum(goodsScrapPrice);

    await goodsTransaction.insertGoodsScrapTransaction(userIdx, goodsIdx, priceWithComma, goodsScrapLabel, options);
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
  const result = {};

  const categoryData = [];
  const exhibitionData = [];

  const goodsCategory = await goodsDao.selectGoodsCategory();
  const goodsCategoryLength = goodsCategory.length;
  for (let i = 0; i < goodsCategoryLength; i++) {
    categoryData.push(goodsCategory[i]);
  }

  result.goods_category_data = categoryData;

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
    exhibition[i].exhibition_img = s3Location + exhibition[i].exhibition_img;
    exhibition[i].exhibition_gradation_img = s3Location + exhibition[i].exhibition_gradation_img;
    exhibitionData.push(exhibition[i]);
  }

  result.exhibition_data = exhibitionData;

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
    exhibitionData[i].exhibition_img = s3Location + exhibitionData[i].exhibition_img;
    exhibitionData[i].exhibition_gradation_img = s3Location + exhibitionData[i].exhibition_gradation_img;
    result.push(exhibitionData[i]);
  }
  return result;
}

// 기획전 굿즈 모두보기
async function getExhibitionGoodsAll(userIdx, exhibitionIdx, lastIndex) {
  const result = [];
  let exhibitionGoodsAll;
  if (lastIndex == -1) {
    exhibitionGoodsAll = await goodsDao.selectFirstExhibitionGoodsAll(exhibitionIdx);
  } else {
    exhibitionGoodsAll = await goodsDao.selectNextExhibitionGoodsAll(exhibitionIdx, lastIndex);
  }
  const exhibitionGoodsAllLength = exhibitionGoodsAll.length;

  for (let i = 0; i < exhibitionGoodsAllLength; i++) {
    const goodsIdx = exhibitionGoodsAll[i].goods_idx;
    const goodsStoreIdx = exhibitionGoodsAll[i].store_idx;
    delete exhibitionGoodsAll[i].store_idx;
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
  const result = {};

  const goodsIdxArr = await goodsDao.selectGoodsIdxByReviewIdx(reviewIdx);
  const goodsIdx = goodsIdxArr[0].goods_idx;
  const goods = await goodsDao.selectGoods(goodsIdx);
  const goodsImg = await goodsDao.selectGoodsImg(goodsIdx);

  const userIdxArr = await goodsDao.selectUserIdxByReviewIdx(reviewIdx);
  const userIdx = userIdxArr[0].user_idx;

  // 리뷰 데이터
  result.review = {
    user_idx: userIdx,
  };

  // 굿즈 데이터
  result.goods = {
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

    reviewComment[i].user_name = user.user_idx;
    reviewComment[i].user_name = user.user_name;
    reviewComment[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    reviewComment[i]
      .goods_review_cmt_date = makeReviewTimeString(reviewComment[i].goods_review_cmt_date);
  }

  // 리뷰 댓글
  result.review_comment = reviewComment;

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

    reviewComment[i].user_name = user.user_idx;
    reviewComment[i].user_name = user.user_name;
    reviewComment[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    reviewComment[i]
      .goods_review_cmt_date = makeReviewTimeString(reviewComment[i].goods_review_cmt_date);
  }

  return reviewComment;
}

async function addReviewComment(userIdx, userIdxForAlarm, reviewIdx, contents, recommentFlag) {
  await goodsTransaction.insertReviewCommentTransaction(userIdx, userIdxForAlarm, reviewIdx, contents, recommentFlag);
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
    const userIdx = goodsReview[i].user_idx;
    // delete goodsReview[i].user_idx;

    const userArr = await userDao.selectUser(userIdx);

    const user = userArr[0];
    const goodsReviewIdx = goodsReview[i].goods_review_idx;
    const goodsReviewImg = await goodsDao.selectReviewImg(goodsReviewIdx);

    // Mysql로부터 얻은 이미지 데이터 배열로 변경
    const imgObjArrLength = goodsReviewImg.length;
    const imgResultArray = [];
    for (let j = 0; j < imgObjArrLength; j++) {
      imgResultArray.push(s3Location + goodsReviewImg[j].goods_review_img);
    }

    // goodsReview[i].user_idx = goodsReview[i].user_idx
    goodsReview[i].user_name = user.user_name;
    goodsReview[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    goodsReview[i]
      .goods_review_date = moment(goodsReview[i].goods_review_date).format('YYYY.MM.DD');

    goodsReview[i].goods_review_img = imgResultArray;

    // 댓글 좋아요 여부
    const reviewLike = await goodsDao.getReviewLike(userIdx, goodsReviewIdx);

    if (reviewLike.length != 0) {
      goodsReview[i].review_like_flag = 1;
    } else {
      goodsReview[i].review_like_flag = 0;
    }
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

async function removeReviewComment(userIdx, reviewIdx, commentIdx) {
  const commentUserIdxArr = await userDao.selectUserIdxByCommentIdx(commentIdx);
  const commentUserIdx = commentUserIdxArr[0].user_idx;

  if (userIdx != commentUserIdx) {
    throw errorResponseObject.accessDinedError;
  }

  await goodsTransaction.deleteReviewCommentTransaction(reviewIdx, commentIdx);
}

async function getGoodsOptionsName(goodsIdx) {
  const goodsOptionNameArr = await goodsDao.selectGoodsOptionsName(goodsIdx);

  const result = { goods_option_name: [] };
  const goodsOptionNameArrLength = goodsOptionNameArr.length;
  for (let i = 0; i < goodsOptionNameArrLength; i++) {
    result.goods_option_name.push(goodsOptionNameArr[i].goods_option_name);
  }

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
    goods_idx: goodsArr[0].goods_idx,
    goods_name: goodsArr[0].goods_name,
    goods_rating: goodsArr[0].goods_rating,
    store_name: goodsArr[0].store_name,
    store_rating: goodsArr[0].store_rating,
    goods_price: goodsArr[0].goods_price,
    goods_delivery_charge: goodsArr[0].goods_delivery_charge,
    goods_delivery_period: goodsArr[0].goods_delivery_period,
    goods_minimum_amount: goodsArr[0].goods_minimum_amount,
    goods_detail: s3Location + goodsArr[0].goods_detail,
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
      .goods_review_date = moment(reviewsArr[i].goods_review_date).format('YYYY.MM.DD');

    reviewsArr[i].goods_review_img = imgResultArray;

    reviews.push(reviewsArr[i]);
  }

  // 굿즈 조회수 +1
  await goodsDao.updateGoodsHit(1, goodsIdx);

  return {
    goods,
    store,
    reviews,
  };
}

async function addGoods(goodsName, storeIdx, price, deliveryCharge, deliveryPeriod, minimumAmount, categoryIdx, files, options, goodsCategoryOptionIdx) {
  // store, category가 없는 경우
  const storeArr = await storeDao.selectStoreName(storeIdx);
  const categoryArr = await goodsDao.goodsCategoryByCategoryIdx(categoryIdx);

  if (storeArr.length == 0) throw errorResponseObject.noStoreDataError;
  if (categoryArr.length == 0) throw errorResponseObject.noCategoryDataError;

  // options parse
  // const optionArr = JSON.parse(options).optionArr;

  // img
  const imgArr = [];
  const filesLength = files.img.length;
  for (let i = 0; i < filesLength; i++) {
    imgArr.push(files.img[i].location.split(s3Location)[1]);
  }
  const storeName = storeArr[0].store_name;

  // contentsImg
  const detailImg = files.detailImg[0].location.split(s3Location)[1];

  // 숫자에 Comma 추가
  const priceWithComma = addCommaIntoNum(price);
  const minimumAmountWithComma = addCommaIntoNum(minimumAmount);
  const deliveryChargeWithComma = addCommaIntoNum(deliveryCharge);

  await goodsTransaction.insertGoodsTransaction(goodsName, storeIdx, storeName, priceWithComma, deliveryChargeWithComma, deliveryPeriod, minimumAmountWithComma, detailImg, categoryIdx, imgArr, options, goodsCategoryOptionIdx);
}

// 카테고리에 따른 굿즈 최소 최대 금액 (옵션 - 최소 수량)
async function getGoodsPriceRange(goodsCategoryIdx, minAmount) {
  // {'price_start':100, 'price_end':40000 }
  let priceRange = await goodsDao.selectPriceRange(goodsCategoryIdx, minAmount);
  [priceRange] = priceRange;

  return priceRange;
}

// 카테고리에 따른 굿즈 모두 보기 (옵션 - 가격, 최소 수량, 옵션)
async function getAllGoods(goodsCategoryIdx, order, lastIndex, priceStart, priceEnd, minAmount, options, userIdx) {
  // {'goods_idx':1, 'goods_name':'asd', 'store_name':'zxc', 'goods_price':'32,000', 'goods_rating':4.2, 'minimum_amount': 10, 'review_cnt': 30, 'goods_img':'/3asd.jpg'}
  let queryFlag;
  if (priceStart || priceEnd || minAmount || options) {
    queryFlag = true;
  } else {
    queryFlag = false;
  }

  const goods = await goodsDao.selectAllGoods(goodsCategoryIdx, order, lastIndex, priceStart, priceEnd, minAmount, options, queryFlag);

  let scrapGoods;
  if (userIdx) scrapGoods = await goodsDao.selectGoodsScrapWithUserIdx(userIdx);


  const goodsLength = goods.length;

  for (let i = 0; i < goodsLength; i++) {
    // add first img url (thumnail)
    goods[i].goods_img = await goodsDao.selectFirstGoodsImg(goods[i].goods_idx) || '';
    goods[i].goods_img = s3Location + parseObj(goods[i].goods_img, 'goods_img')[0];

    // add store name
    goods[i].store_name = await storeDao.selectStoreName(goods[i].store_idx) || '';
    goods[i].store_name = goods[i].store_name[0].store_name;
    delete goods[i].store_idx;

    // add like flag
    if (userIdx) {
      goods[i].goods_like_flag = scrapGoods.includes(goods[i].goods_idx);
    }
  }
  return goods;
}

// 견적 옵션
async function getGoodsOption(goodsIdx) {
  const result = [];
  const goodsOptionArr = await goodsDao.selectGoodsOption(goodsIdx);

  const goodsOptionLength = goodsOptionArr.length;
  for (let i = 0; i < goodsOptionLength; i++) {
    const goodsOptionIdx = goodsOptionArr[i].goods_option_idx;
    const goodsOptionDetailArr = await goodsDao.selectGoodsOptionDetail(goodsOptionIdx);
    const goodsOptionDetailLength = goodsOptionDetailArr.length;

    goodsOptionArr[i].goods_option_detail = [];


    for (let k = 0; k < goodsOptionDetailLength; k++) {
      const goodsOptionDetailObject = {};
      // goodsOptionArr[i].goods_option_detail[k] = goodsOptionDetailArr[k].goods_option_detail_name;
      goodsOptionDetailObject.goods_option_detail_name = goodsOptionDetailArr[k].goods_option_detail_name;
      goodsOptionDetailObject.goods_option_detail_price = goodsOptionDetailArr[k].goods_option_detail_price;
      goodsOptionArr[i].goods_option_detail[k] = goodsOptionDetailObject;
    }
    result.push(goodsOptionArr[i]);
  }
  return result;
}

// 찜 수정하기
async function modifyUserGoodsOption(goodsScrapIdx, userIdx, goodsIdx, goodsScrapPrice, goodsScrapLabel, options) {
  const goodsScrapArr = await goodsDao.selectGoodsScrapOptionFlag(userIdx, goodsIdx, goodsScrapIdx);
  // const goodsScrapIdx = await goodsDao.goodsScrapArr[0].goods_scrap_idx;
  const goodsScrapOptionFlag = goodsScrapArr[0].goods_scrap_option_flag;
  if (goodsScrapOptionFlag == 1) {
    // 견적옵션이 있을 경우 - update
    await goodsDao.updateGoodsScrap(goodsScrapLabel, goodsScrapPrice, goodsScrapIdx);
    await goodsDao.updateGoodsScrapOption(options, goodsScrapIdx);
  } else {
    // 견적옵션이 없을 경우 - 새로 insert
    await goodsDao.insertGoodsScrapOption(goodsScrapIdx, options);
    await goodsDao.updateGoodsScrap(goodsScrapLabel, goodsScrapPrice, goodsScrapIdx);
    await goodsDao.updateGoodsScrapOptionFlag(goodsScrapIdx);
  }
}

async function getCategoryOption(goodsCategoryIdx) {
  const options = await goodsDao.selectCategoryOption(goodsCategoryIdx);

  return options;
}

async function getGoodsBySearch(userIdx, searchAfter, goodsName, order) {
  const goodsFromES = await elasticsearchGoods.getGoodsByGoodsName(searchAfter, goodsName, order);

  const goodsLength = goodsFromES.goods.length;
  for (let i = 0; i < goodsLength; i++) {
    // img
    goodsFromES.goods[i].goods_img = s3Location + goodsFromES.goods[i].goods_img[0];

    const goodsIdx = goodsFromES.goods[i].goods_idx;
    // 유저 즐겨찾기 flag 추가
    const user = await userDao.selectUserWithGoods(userIdx, goodsIdx);

    if (user.length === 0) {
      goodsFromES.goods[i].scrap_flag = 0;
    } else {
      goodsFromES.goods[i].scrap_flag = 1;
    }
  }

  return goodsFromES;
}

async function addCategory(categoryName) {
  await goodsDao.insertCategory(categoryName);
}

async function addCategoryOption(categoryIdx, categoryOption) {
  await goodsTransaction.insertCategoryOptionTransaction(categoryIdx, categoryOption);
}

async function addGoodsReview(goodsIdx, userIdx, rating, content, img) {
  await goodsTransaction.insertGoodsReviewTransaction(goodsIdx, userIdx, rating, content, img);
}

async function editGoodsReview(goodsIdx, reviewIdx, userIdx, rating, content, img) {
  await goodsTransaction.updateGoodsReviewTransaction(goodsIdx, reviewIdx, userIdx, rating, content, img);
}

async function removeGoodsReview(goodsIdx, reviewIdx) {
  await goodsTransaction.deleteGoodsReviewTransaction(goodsIdx, reviewIdx);
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
  modifyUserGoodsOption,
  getCategoryOption,
  getGoodsBySearch,
  addCategory,
  addCategoryOption,
  addGoodsReview,
  editGoodsReview,
  removeGoodsReview,
};
