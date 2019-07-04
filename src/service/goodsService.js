const goodsDao = require('../dao/goodsDao');
const userDao = require('../dao/userDao');
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
  for (let i = 0;i<goodsCategoryLength; i++) {
    categoryData.push(goodsCategory[i]);
  }

  subResult.goods_category_data = categoryData;

  const exhibition = await goodsDao.selectExhibition(); 
  const exhibitionGoods = await goodsDao.selectExhibitionGoods();

  const exhibitLength = exhibition.length; //exhibition_idx 를 위해 
  const exhibitGoodsLength = exhibitionGoods.length;


  for (let i = 0; i < exhibitLength; i++) {
    const exhibitionIdx = exhibition[i].exhibition_idx;
    exhibition[i].goods_data = [];
    for (let k = 0; k < exhibitGoodsLength; k++) {
      if (exhibitionIdx == exhibitionGoods[k].exhibition_idx) {
        exhibition[i].goods_data.push(exhibitionGoods[k]);
      }    
    }
    exhibitionData.push(exhibition[i]);
  }

  subResult.exhibition_goods_data = exhibitionData;

  result.push(subResult);

  return result;
}

//굿즈카테고리 페이지네이션
async function getGoodsCategoryPagination(lastIndex) { //굿즈카테고리 인덱스가 라스트 인덱스로
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
async function getExhibitionGoodsAll(exhibitionIdx,lastIndex) {
  const result = [];
  const exhibitionGoodsAll = await goodsDao.selectExhibitionGoodsAll(exhibitionIdx, lastIndex);
  const exhibitionGoodsAllLength = exhibitionGoodsAll.length;

  for (let i = 0; i < exhibitionGoodsAllLength; i++) {
    result.push(exhibitionGoodsAll[i]);
  }
  return result;
  
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

};
