const goodsDao = require('../dao/goodsDao');
const userDao = require('../dao/userDao');

const { makeReviewTimeString } = require('../library/changeTimeString');

async function getBestGoods(userId, lastIndex) {
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
    const user = await userDao.selectUserWithGoods(userId, goodsIdx);

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

async function getBestReviews(lastIndex) {
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

      // Mysql로부터 얻은 이미지 데이터 배열로 변
      const imgObjArrLength = imgObjArr.length;
      const imgResultArray = [];
      for (let j = 0; j < imgObjArrLength; j++) {
        imgResultArray.push(imgObjArr[j].goods_review_img);
      }

      reviews[i].goods_review_img = imgResultArray;
    }

    // 작성시간 String 수정
    reviews[i].goods_review_date = makeReviewTimeString(reviews[i].goods_review_date);

    result.push(reviews[i]);
  }

  return result;
}

module.exports = {
  getBestGoods,
  getBestReviews,
};
