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
  ORDER BY goods_score DESC, goods_idx DESC 
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
  ORDER BY goods_score DESC, goods_idx DESC 
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
  USER.user_img as user_img,
  goods_review_idx,
  goods_review_date,
  goods_review_rating,
  goods_review_content,
  goods_review_like_count,
  goods_review_cmt_count,
  goods_review_photo_flag
  FROM GOODS_REVIEW
  JOIN USER ON GOODS_REVIEW.user_idx = USER.user_idx
  ORDER BY goods_review_rating DESC, goods_review_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql);

  return result;
}

async function selectNextBestReviews(lastIndex) {
  const sql = `
  SELECT 
  USER.user_name as user_name,
  USER.user_img as user_img,
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
  ORDER BY goods_review_rating DESC, goods_review_idx DESC
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
async function getReviewLike(userIdx, reviewIdx) {
  const sql = `
  SELECT * FROM GOODS_REVIEW_LIKE
  WHERE user_idx = ? AND goods_review_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx, reviewIdx]);

  return result;
}


// 리뷰 좋아요
async function insertReviewLike(userIdx, reviewIdx) {
  const sql = `
  INSERT INTO GOODS_REVIEW_LIKE
  (user_idx, goods_review_idx)
  VALUES
  (?, ?)
  `;

  await mysql.query(sql, [userIdx, reviewIdx]);
}

// 리뷰 좋아요 취소
async function deleteReviewLike(userIdx, reviewIdx) {
  const sql = `
  DELETE FROM GOODS_REVIEW_LIKE
  WHERE user_idx = ? AND goods_review_idx = ?
  `;

  await mysql.query(sql, [userIdx, reviewIdx]);
}

// 굿즈 찜하기 (견적 없음)
async function insertGoodsScrap(userIdx, goodsIdx, goodsScrapPrice, label) {
  const sql = `
  INSERT INTO GOODS_SCRAP
  (user_idx, goods_idx, goods_scrap_label, goods_scrap_price)
  VALUES 
  (?, ?, ?, ?)
  `;

  await mysql.query(sql, [userIdx, goodsIdx, label, goodsScrapPrice]);
}

// 모든 견적의 옵션 가져오기
async function getAllGoodsScrapOption(userIdx, goodsIdx) {
  const sql = `
  SELECT 
  GOODS_SCRAP_OPTION.goods_scrap_option as goods_scrap_option,
  GOODS_SCRAP.goods_scrap_label as goods_scrap_label
  FROM GOODS_SCRAP 
  JOIN
  GOODS_SCRAP_OPTION 
  ON GOODS_SCRAP.goods_scrap_idx = GOODS_SCRAP_OPTION.goods_scrap_idx
  WHERE GOODS_SCRAP.user_idx = ? AND GOODS_SCRAP.goods_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx, goodsIdx]);

  return result;
}

async function selectGoodsScrapOptionFlag(userIdx, goodsIdx, goodsScrapIdx) {
  const sql = `
  SELECT goods_scrap_option_flag
  FROM GOODS_SCRAP
  WHERE user_idx = ?
  AND goods_idx = ?
  AND goods_scrap_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx, goodsIdx, goodsScrapIdx]);

  return result;
}

async function insertGoodsScrapOption(goodsScrapIdx, goodsScrapOption) {
  const sql = `
  INSERT INTO GOODS_SCRAP_OPTION 
  (goods_scrap_idx, goods_scrap_option) 
  VALUES (?,?)
  `;

  const result = await mysql.query(sql, [goodsScrapIdx, goodsScrapOption]);

  return result;
}

async function updateGoodsScrapOption(goodsScrapOption, goodsScrapIdx) {
  const sql = `
  UPDATE GOODS_SCRAP_OPTION 
  SET goods_scrap_option = ?
  WHERE goods_scrap_idx = ?
  `;

  const result = await mysql.query(sql, [goodsScrapOption, goodsScrapIdx]);

  return result;
}

// 나의 찜 굿즈에서 견적 옵션 없을 때 혹은 없을 때 가격과 라벨도 새로 업데이트
async function updateGoodsScrap(goodsScrapLabel, goodsScrapPrice, goodsScrapIdx) {
  const sql = `
  UPDATE GOODS_SCRAP 
  SET goods_scrap_label = ?,
  goods_scrap_price = ?
  WHERE goods_scrap_idx = ?
  `;

  const result = await mysql.query(sql, [goodsScrapLabel, goodsScrapPrice, goodsScrapIdx]);
  return result;
}

async function updateGoodsScrapOptionFlag(goodsScrapIdx) {
  const sql = `
  UPDATE GOODS_SCRAP 
  SET goods_scrap_option_flag= 1
  WHERE goods_scrap_idx = ?
  `;

  const result = await mysql.query(sql, [goodsScrapIdx]);
  return result;
}

// 굿즈탭에서 찜해제
async function deleteGoodsScrap(userIdx, goodsIdx) {
  const sql = `
  DELETE FROM GOODS_SCRAP
  WHERE user_idx = ? AND goods_idx = ? AND goods_scrap_option_flag = 0
  `;

  await mysql.query(sql, [userIdx, goodsIdx]);
}

// 찜탭에서 찜해제
async function deleteGoodsScrapByscrapIdx(scrapIdx) {
  const sql = `
  DELETE FROM GOODS_SCRAP
  WHERE goods_scrap_idx = ?
  `;

  await mysql.query(sql, [scrapIdx]);
}

// 굿즈탭 보기 (위에 카테고리랑 아래 기획전 및 관련 굿즈들)
async function selectGoodsCategory() {
  const sql = `
  SELECT goods_category_idx,goods_category_name 
  FROM GOODS_CATEGORY 
  LIMIT ${mysqlConfig.paginationCnt}
  `;
  const result = await mysql.query(sql);
  return result;
}

async function selectExhibition() {
  const sql = `
  SELECT *
  FROM EXHIBITION
  ORDER BY exhibition_idx DESC
  LIMIT ${mysqlConfig.exhibitionPaginationCnt}
  `;
  const result = await mysql.query(sql);
  return result;
}

async function selectExhibitionGoods() {
  const sql = `
  SELECT ex.exhibition_idx,g.*
  FROM GOODS g,EXHIBITION ex,EXHIBITION_GOODS ex_g
  WHERE ex_g.goods_idx = g.goods_idx and ex.exhibition_idx = ex_g.exhibition_idx
  ORDER BY ex.exhibition_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;
  const result = await mysql.query(sql);
  return result;
}

// 굿즈카테고리 페이지네이션
async function selectGoodsCategoryPaging(lastIndex) {
  const sql = `
  SELECT goods_category_idx,goods_category_name 
  FROM GOODS_CATEGORY 
  WHERE goods_category_idx > ?
  ORDER BY goods_category_idx ASC
  LIMIT ${mysqlConfig.paginationCnt}
  `;
  const result = await mysql.query(sql, [lastIndex]);

  return result;
}

// 기획전 페이지네이션
async function selectExhibitionPaging(lastIndex) {
  const sql = `
  SELECT ex.*
  FROM EXHIBITION ex
  WHERE ex.exhibition_idx < ?
  ORDER BY ex.exhibition_idx DESC
  LIMIT ${mysqlConfig.exhibitionPaginationCnt}
  `;
  const result = await mysql.query(sql, [lastIndex]);

  return result;
}

// 기획전 굿즈
async function selectFirstExhibitionGoodsAll(exhibitionIdx) {
  const sql = `
  SELECT g.goods_idx,
  g.goods_name,
  g.goods_rating,
  g.goods_price,
  g.goods_minimum_amount,
  g.goods_review_cnt,
  g.store_idx
  FROM GOODS g,EXHIBITION_GOODS exg
  WHERE exg.exhibition_idx = ?
  AND g.goods_idx = exg.goods_idx
  ORDER BY g.goods_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;
  const result = await mysql.query(sql, [exhibitionIdx]);

  return result;
}
// 기획전 굿즈
async function selectNextExhibitionGoodsAll(exhibitionIdx, lastIndex) {
  const sql = `
  SELECT g.goods_idx,
  g.goods_name,
  g.goods_rating,
  g.goods_price,
  g.goods_minimum_amount,
  g.goods_review_cnt,
  g.store_idx
  FROM GOODS g,EXHIBITION_GOODS exg
  WHERE exg.exhibition_idx = ?
  AND g.goods_idx = exg.goods_idx
  AND exg.goods_idx < ?
  ORDER BY g.goods_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;
  const result = await mysql.query(sql, [exhibitionIdx, lastIndex]);

  return result;
}

async function selectGoodsIdxByReviewIdx(reviewIdx) {
  const sql = `
  SELECT
  goods_idx
  FROM GOODS_REVIEW
  WHERE goods_review_idx = ?
  `;

  const result = await mysql.query(sql, [reviewIdx]);

  return result;
}

// 굿즈 데이터 가져오기
async function selectGoods(goodsIdx) {
  const sql = `
  SELECT 
  goods_idx,
  goods_name,
  goods_rating,
  goods_price,
  goods_delivery_charge
  goods_delivery_period,
  goods_minimum_amount,
  goods_detail,
  goods_review_cnt,
  store_name,
  store_url
  FROM GOODS
  JOIN
  STORE
  ON GOODS.store_idx = STORE.store_idx
  WHERE goods_idx = ?
  `;

  const result = await mysql.query(sql, [goodsIdx]);

  return result;
}

// 첫 리뷰 N개 가져오기
async function selectFirstReviewComments(reviewIdx) {
  const sql = `
  SELECT 
  goods_review_cmt_idx,
  user_idx,
  goods_review_cmt_content,
  goods_review_cmt_date
  FROM GOODS_REVIEW_COMMENT
  WHERE goods_review_idx = ?
  ORDER BY goods_review_cmt_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [reviewIdx]);

  return result;
}

// 다음 리뷰 N개 가져오기
async function selectNextReviewComments(reviewIdx, lastIndex) {
  const sql = `
  SELECT 
  goods_review_cmt_idx,
  user_idx,
  goods_review_cmt_content,
  goods_review_cmt_date
  FROM GOODS_REVIEW_COMMENT
  WHERE goods_review_idx = ? AND goods_review_cmt_idx < ?
  ORDER BY goods_review_cmt_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [reviewIdx, lastIndex]);

  return result;
}

// 굿즈 리뷰 댓글 달기
async function insertReviewComment(userIdx, reviewIdx, content) {
  const sql = `
  INSERT INTO GOODS_REVIEW_COMMENT
  (goods_review_idx, user_idx, goods_review_cmt_content)
  VALUES
  (?, ?, ?)
  `;

  await mysql.query(sql, [reviewIdx, userIdx, content]);
}

// 굿즈 리뷰 댓글 달기(대댓글)
async function insertReviewRecomment(userIdx, reviewIdx, content, recommentFlag) {
  const sql = `
  INSERT INTO GOODS_REVIEW_COMMENT
  (goods_review_idx, user_idx, goods_review_cmt_content, goods_review_recmt_flag)
  VALUES
  (?, ?, ?, ?)
  `;

  await mysql.query(sql, [reviewIdx, userIdx, content, recommentFlag]);
}

// 해당 굿즈의 리뷰 모두 가져오기

async function selectFirstGoodsReviews(goodsIdx, photoFlag) {
  const sql = `
  SELECT 
  gr.goods_review_idx,
  gr.goods_review_photo_flag,
  gr.goods_review_date,
  gr.goods_review_rating,
  gr.goods_review_content,
  gr.goods_review_like_count,
  gr.goods_review_cmt_count,
  gr.goods_review_photo_flag,
  gr.user_idx
  FROM GOODS_REVIEW gr
  WHERE gr.goods_idx = ?
  AND gr.goods_review_photo_flag = ?
  ORDER BY gr.goods_review_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [goodsIdx, photoFlag]);

  return result;
}

async function selectNextGoodsReviews(goodsIdx, photoFlag, lastIndex) {
  const sql = `
  SELECT 
  gr.goods_review_idx,
  gr.goods_review_date,
  gr.goods_review_rating,
  gr.goods_review_content,
  gr.goods_review_like_count,
  gr.goods_review_cmt_count,
  gr.goods_review_photo_flag,
  gr.user_idx
  FROM GOODS_REVIEW gr
  WHERE gr.goods_idx = ?
  AND gr.goods_review_photo_flag = ?
  AND gr.goods_review_idx < ?
  ORDER BY gr.goods_review_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [goodsIdx, photoFlag, lastIndex]);

  return result;
}

async function selectFirstGoodsReviewsAll(goodsIdx) {
  const sql = `
  SELECT 
  gr.goods_review_idx,
  gr.goods_review_date,
  gr.goods_review_rating,
  gr.goods_review_content,
  gr.goods_review_like_count,
  gr.goods_review_cmt_count,
  gr.goods_review_photo_flag,
  gr.user_idx
  FROM GOODS_REVIEW gr
  WHERE gr.goods_idx = ?
  ORDER BY gr.goods_review_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [goodsIdx]);

  return result;
}

async function selectNextGoodsReviewsAll(goodsIdx, lastIndex) {
  const sql = `
  SELECT 
  gr.goods_review_idx,
  gr.goods_review_date,
  gr.goods_review_rating,
  gr.goods_review_content,
  gr.goods_review_like_count,
  gr.goods_review_cmt_count,
  gr.goods_review_photo_flag,
  gr.user_idx
  FROM GOODS_REVIEW gr
  WHERE gr.goods_idx = ?
  AND gr.goods_review_idx < ?
  ORDER BY gr.goods_review_idx DESC
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [goodsIdx, lastIndex]);
  return result;
}

async function updateReviewComment(commentIdx, contents) {
  const sql = `
  UPDATE GOODS_REVIEW_COMMENT
  SET goods_review_cmt_content = ?
  WHERE goods_review_cmt_idx = ?
  `;

  await mysql.query(sql, [contents, commentIdx]);
}

async function deleteReviewComment(commentIdx) {
  const sql = `
  DELETE FROM GOODS_REVIEW_COMMENT
  WHERE goods_review_cmt_idx = ?
  `;

  await mysql.query(sql, [commentIdx]);
}

async function selectGoodsOptionsName(goodsIdx) {
  const sql = `
  SELECT goods_option_name
  FROM GOODS_OPTION
  WHERE goods_idx = ?
  `;

  const result = await mysql.query(sql, [goodsIdx]);

  return result;
}

async function insertUserRecentGoods(userIdx, goodsIdx) {
  const sql = `
  INSERT INTO USER_RECENT_GOODS
  (user_idx, goods_idx)
  VALUES
  (?, ?)
  `;

  await mysql.query(sql, [userIdx, goodsIdx]);
}

async function selectUserRecentGoods(userIdx, goodsIdx) {
  const sql = `
  SELECT 
  user_idx,
  goods_idx,
  user_recent_goods_date_time
  FROM USER_RECENT_GOODS
  WHERE user_idx = ? AND goods_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx, goodsIdx]);

  return result;
}

async function updateUserRecentGoods(userIdx, goodsIdx, currentTime) {
  const sql = `
  UPDATE USER_RECENT_GOODS
  SET user_recent_goods_date_time = ?
  WHERE user_idx = ? AND goods_idx = ?
  `;

  await mysql.query(sql, [currentTime, userIdx, goodsIdx]);
}

async function goodsCategoryByCategoryIdx(categoryIdx) {
  const sql = `
  SELECT
  goods_category_name
  FROM GOODS_CATEGORY
  WHERE goods_category_idx = ?
  `;

  const result = await mysql.query(sql, [categoryIdx]);

  return result;
}

async function selectPriceRange(goodsCategoryIdx, minAmount) {
  let sql = `
  SELECT 
  MIN(goods_price) as price_start,
  MAX(goods_price) as price_end
  FROM GOODS
  WHERE goods_category_idx = ?
  `;

  if (minAmount) {
    sql += `AND goods_minimum_amount <= ${minAmount}`;
  }

  const result = await mysql.query(sql, [goodsCategoryIdx]);

  return result;
}

async function selectStoreGoods(storeIdx, order, lastIndex, goodsCategoryIdx) {
  let sql = `
  SELECT goods_idx, store_idx, goods_name, goods_price, goods_rating, goods_minimum_amount, goods_review_cnt
  FROM GOODS
  WHERE store_idx = ? AND goods_idx > ?
  `;

  if (goodsCategoryIdx) {
    sql += `AND goods_category_idx = ${goodsCategoryIdx}`;
  }

  if (order == 0) {
    sql += ' ORDER BY goods_score DESC';
  } else if (order == 1) { // 고가순
    sql += ' ORDER BY goods_price DESC';
  } else if (order == 2) { // 저가순
    sql += ' ORDER BY goods_price';
  }

  sql += ` LIMIT ${mysqlConfig.paginationCnt}`;

  const result = await mysql.query(sql, [storeIdx, lastIndex]);

  return result;
}

async function selectFirstGoodsImg(goodsIdx) {
  const sql = `
  SELECT goods_img
  FROM GOODS_IMG
  WHERE goods_idx = ?
  LIMIT 1
  `;

  const result = await mysql.query(sql, [goodsIdx]);

  return result;
}

async function selectGoodsScrapWithUserIdx(userIdx) {
  const sql = `
  SELECT goods_idx
  FROM GOODS_SCRAP
  WHERE user_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx]);

  return result;
}

async function selectAllGoods(goodsCategoryIdx, order, lastIndex, priceStart, priceEnd, minAmount, options, queryFlag) {
  let sql = `
  SELECT goods_idx, store_idx, goods_name, goods_price, goods_rating, goods_minimum_amount, goods_review_cnt
  FROM GOODS
  WHERE goods_category_idx = ? AND goods_idx > ?
  `;

  if (queryFlag) {
    if (priceStart) {
      sql += `
      AND goods_price >= ${priceStart}`;
    }
    if (priceEnd) {
      sql += `
      AND goods_price <= ${priceEnd}`;
    }
    if (minAmount) {
      sql += `
      AND goods_minimum_amount <= ${minAmount}`;
    }
    if (options) {
      sql += `
      AND goods_idx IN (SELECT goods_idx FROM GOODS_CATEGORY_OPTION_DETAIL_GOODS WHERE goods_category_option_detail_idx IN (${options.slice(1, -1)}))
      `;
    }
  }

  if (order == 0) {
    sql += ' ORDER BY goods_score DESC';
  } else if (order == 1) { // 고가순
    sql += ' ORDER BY goods_price DESC';
  } else if (order == 2) { // 저가순
    sql += ' ORDER BY goods_price';
  }

  sql += ` LIMIT ${mysqlConfig.paginationCnt}`;

  const result = await mysql.query(sql, [goodsCategoryIdx, lastIndex, options]);

  return result;
}

async function selectGoodsOption(goodsIdx) {
  const sql = `
  SELECT *
  FROM GOODS_OPTION
  WHERE goods_idx = ?
  `;

  const result = await mysql.query(sql, [goodsIdx]);
  return result;
}

// async function selectGoodsOption(goodsIdx) {
//   const sql = `
//   SELECT goods_option_idx,
//   goods_option_name
//   FROM GOODS_OPTION
//   WHERE goods_idx = ?
//   `;

//   const result = await mysql.query(sql, [goodsIdx]);
//   return result;
// }

async function selectGoodsOptionDetail(goodsOptionIdx) {
  const sql = `
  SELECT goods_option_detail_name,
  goods_option_detail_price
  FROM GOODS_OPTION_DETAIL
  WHERE goods_option_idx = ?
  `;

  const result = await mysql.query(sql, [goodsOptionIdx]);
  return result;
}


async function selectCategoryOption(goodsCategoryIdx) {
  const sql = `
  SELECT goods_category_option_idx as category_option_idx, goods_category_option_name as category_option_name
  FROM GOODS_CATEGORY_OPTION
  WHERE goods_category_idx = ?
  `;
  const result = await mysql.query(sql, [goodsCategoryIdx]);
  return result;
}

async function selectCategoryOptionDetail(categoryOptionIdx) {
  const sql = `
  SELECT goods_category_option_detail_idx as category_option_detail_idx, goods_category_option_detail_name as category_option_detail_name
  FROM GOODS_CATEGORY_OPTION_DETAIL
  WHERE goods_category_option_idx = ?
  `;
  const result = await mysql.query(sql, [categoryOptionIdx]);
  return result;
}

async function updateAllGoodsHit(value) {
  const sql = `
  UPDATE GOODS SET goods_hit = ?
  `;

  await mysql.query(sql, [value]);
}

async function updateAllGoodsReviewWeekCnt(value) {
  const sql = `
  UPDATE GOODS SET goods_review_week_cnt = ?
  `;

  await mysql.query(sql, [value]);
}

async function updateAllGoodsRank() {
  const sql = `
  UPDATE GOODS SET goods_score = goods_review_week_cnt + goods_hit;
  `;

  await mysql.query(sql);
}

async function updateGoodsHit(value, goodsIdx) {
  const sql = `
  UPDATE GOODS SET goods_hit = goods_hit + ? WHERE goods_idx = ?
  `;

  await mysql.query(sql, [value, goodsIdx]);
}

async function insertCategory(categoryName) {
  const sql = `
  INSERT INTO GOODS_CATEGORY
  (goods_category_name)
  VALUES
  (?)
  `;

  await mysql.query(sql, [categoryName]);
}

async function selectStoreGoodsCategory(storeIdx) {
  const sql = `
  SELECT goods_category_idx, goods_category_name
  FROM GOODS_CATEGORY
  WHERE goods_category_idx IN (
    SELECT DISTINCT goods_category_idx
    FROM GOODS
    WHERE store_idx = ?
  )
  `;

  const result = await mysql.query(sql, [storeIdx]);

  return result;
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
  selectGoodsCategory,
  selectExhibition,
  selectExhibitionGoods,
  selectGoodsCategoryPaging,
  selectExhibitionPaging,
  selectFirstExhibitionGoodsAll,
  selectNextExhibitionGoodsAll,
  selectGoodsIdxByReviewIdx,
  selectGoods,
  selectFirstReviewComments,
  selectNextReviewComments,
  insertReviewComment,
  insertReviewRecomment,
  selectFirstGoodsReviews,
  selectNextGoodsReviews,
  selectFirstGoodsReviewsAll,
  selectNextGoodsReviewsAll,
  updateReviewComment,
  deleteReviewComment,
  selectGoodsOptionsName,
  insertUserRecentGoods,
  selectUserRecentGoods,
  updateUserRecentGoods,
  goodsCategoryByCategoryIdx,
  selectPriceRange,
  selectStoreGoods,
  selectFirstGoodsImg,
  selectGoodsScrapWithUserIdx,
  selectAllGoods,
  selectGoodsOption,
  selectGoodsOptionDetail,
  selectCategoryOption,
  selectCategoryOptionDetail,
  updateAllGoodsHit,
  updateAllGoodsReviewWeekCnt,
  updateAllGoodsRank,
  updateGoodsHit,
  insertCategory,
  selectStoreGoodsCategory,
  selectGoodsScrapOptionFlag,
  insertGoodsScrapOption,
  updateGoodsScrapOption,
  updateGoodsScrap,
  updateGoodsScrapOptionFlag,

};
