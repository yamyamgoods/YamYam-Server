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

// 좋아요 여부 확인
async function getReviewLike(userId, reviewIdx) {
  const sql = `
  SELECT * FROM GOODS_REVIEW_LIKE
  WHERE user_idx = ? AND goods_review_idx = ?
  `;

  const result = await mysql.query(sql, [userId, reviewIdx]);

  return result;
}


// 리뷰 좋아요
async function insertReviewLike(userId, reviewIdx) {
  const sql = `
  INSERT INTO GOODS_REVIEW_LIKE
  (user_idx, goods_review_idx)
  VALUES
  (?, ?)
  `;

  await mysql.query(sql, [userId, reviewIdx]);
}

// 리뷰 좋아요 취소
async function deleteReviewLike(userId, reviewIdx) {
  const sql = `
  DELETE FROM GOODS_REVIEW_LIKE
  WHERE user_idx = ? AND goods_review_idx = ?
  `;

  await mysql.query(sql, [userId, reviewIdx]);
}

// 굿즈 찜하기 (견적 없음)
async function insertGoodsScrap(userId, goodsIdx, goodsScrapPrice, label) {
  const sql = `
  INSERT INTO GOODS_SCRAP
  (user_idx, goods_idx, goods_scrap_label, goods_scrap_price)
  VALUES 
  (?, ?, ?, ?)
  `;

  await mysql.query(sql, [userId, goodsIdx, label, goodsScrapPrice]);
}

// 모든 견적의 옵션 가져오기
async function getAllGoodsScrapOption(userId, goodsIdx) {
  const sql = `
  SELECT * FROM GOODS_SCRAP 
  JOIN
  USER_SCRAP_OPTION 
  ON GOODS_SCRAP.goods_scrap_idx = USER_SCRAP_OPTION.goods_scrap_idx
  WHERE GOODS_SCRAP.user_idx = ? AND GOODS_SCRAP.goods_idx = ?
  `;

  const result = await mysql.query(sql, [userId, goodsIdx]);

  return result;
}

// 굿즈탭에서 찜해제
async function deleteGoodsScrap(userId, goodsIdx) {
  const sql = `
  DELETE FROM GOODS_SCRAP
  WHERE user_idx = ? AND goods_idx = ? AND goods_scrap_option_flag = 0
  `;

  await mysql.query(sql, [userId, goodsIdx]);
}

// 찜탭에서 찜해제
async function deleteGoodsScrapByscrapIdx(scrapIdx) {
  const sql = `
  DELETE FROM GOODS_SCRAP
  WHERE goods_scrap_idx = ?
  `;

  await mysql.query(sql, [scrapIdx]);
}

module.exports = {
  selectFirstBestGoods,
  selectNextBestGoods,
  selectGoodsImg,
  selectFirstBestReviews,
  selectNextBestReviews,
  selectReviewImg,
  getReviewLike,
  insertReviewLike,
  deleteReviewLike,
  insertGoodsScrap,
  getAllGoodsScrapOption,
  deleteGoodsScrap,
  deleteGoodsScrapByscrapIdx,
};
