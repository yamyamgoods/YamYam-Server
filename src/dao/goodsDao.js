const mysql = require('../library/mysql');
const mysqlConfig = require('../../config/mysqlConfig');

// BestGoods 첫 N개 가져오기
async function selectFirstBestGoods() {
  const sql = `
  SELECT 
  GOODS.goods_idx as goods_idx,
  store_name,
  goods_category_idx,
  goods_name,
  goods_rating,
  goods_price,
  goods_minimum_amount,
  goods_review_cnt
  FROM GOODS 
  JOIN STORE ON GOODS.store_idx = STORE.store_idx 
  ORDER BY goods_score, goods_idx DESC 
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql);

  return result;
}

// BestGoods 다음 N개 가져오기
async function selectNextBestGoods(lastIndex) {
  const sql = `
  SELECT 
  GOODS.goods_idx as goods_idx,
  store_name,
  goods_category_idx,
  goods_name,
  goods_rating,
  goods_price,
  goods_minimum_amount,
  goods_review_cnt
  FROM GOODS 
  JOIN STORE ON GOODS.store_idx = STORE.store_idx 
  WHERE goods_idx < ?
  ORDER BY goods_score, goods_idx DESC 
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [lastIndex]);

  return result;
}

// 굿즈 이미지 가져오기
async function selectGoodsImg(goodsIdx) {
  const sql = `
  SELECT goods_img 
  FROM GOODS_IMG
  WHERE goods_idx = ?
  ORDER BY goods_img_idx ASC
  `;

  const result = await mysql.query(sql, [goodsIdx]);

  return result;
}

async function selectFirstBestReviews() {
  const sql = `
  SELECT 
  USER.user_name as user_name,
  goods_review_idx,
  goods_idx,
  goods_review_date,
  goods_review_rating,
  goods_review_content,
  goods_review_like_count,
  goods_review_cmt_count,
  goods_review_photo_flag
  FROM GOODS_REVIEW
  JOIN USER ON GOODS_REVIEW.user_idx = USER.user_idx
  ORDER BY goods_review_rating, goods_review_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql);

  return result;
}

async function selectNextBestReviews(lastIndex) {
  const sql = `
  SELECT 
  USER.user_name as user_name,
  goods_review_idx,
  goods_review_date,
  goods_review_rating,
  goods_review_content,
  goods_review_like_count,
  goods_review_cmt_count,
  goods_review_photo_flag
  FROM GOODS_REVIEW
  JOIN USER ON GOODS_REVIEW.user_idx = USER.user_idx
  WHERE goods_review_idx < ?
  ORDER BY goods_review_rating, goods_review_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [lastIndex]);

  return result;
}

async function selectReviewImg(reviewIdx) {
  const sql = `
  SELECT
  goods_review_idx,
  goods_review_img
  FROM GOODS_REVIEW_IMG
  WHERE goods_review_idx = ?
  ORDER BY goods_review_img_idx ASC
  `;

  const result = await mysql.query(sql, [reviewIdx]);

  return result;
}

module.exports = {
  selectFirstBestGoods,
  selectNextBestGoods,
  selectGoodsImg,
  selectFirstBestReviews,
  selectNextBestReviews,
  selectReviewImg,
};
