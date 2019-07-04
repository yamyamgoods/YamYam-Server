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
      console.log(options);
      console.log(allOptions[i].goods_scrap_options);
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

module.exports = {
  getBestGoods,
  getBestReviews,
  addReviewLike,
  removeReviewLike,
  addGoodsScrap,
  removeGoodsScrap,
};
