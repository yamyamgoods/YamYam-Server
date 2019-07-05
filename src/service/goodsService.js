const goodsDao = require('../dao/goodsDao');
const userDao = require('../dao/userDao');
const stroeDao = require('../dao/storeDao');
const goodsTransaction = require('../dao/goodsTransaction');
const errorResponseObject = require('../../config/errorResponseObject');
const { makeReviewTimeString } = require('../library/changeTimeString');

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
    goods[i].goods_img = goodsImg[0].goods_img;

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
        imgResultArray.push(imgObjArr[j].goods_review_img);
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
    const storeName = await stroeDao.selectStoreName(goodsStoreIdx);
    exhibitionGoodsAll[i].store_name = storeName[0].store_name;

    // 유저 즐겨찾기 flag 추가
    if (user.length === 0) {
      exhibitionGoodsAll[i].scrap_flag = 0;
    } else {
      exhibitionGoodsAll[i].scrap_flag = 1;
    }

    // 굿즈이미지 한개 골라서 추가
    const goodsImg = await goodsDao.selectGoodsImg(goodsIdx);
    exhibitionGoodsAll[i].goods_img = goodsImg[0].goods_img;

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
    goods_img: goodsImg[0].goods_img,
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
    reviewComment[i].user_img = user.user_img;

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
    reviewComment[i].user_img = user.user_img;

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
};
