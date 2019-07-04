const mysql = require('../library/mysql');
const mysqlConfig = require('../../config/mysqlConfig');

async function selectStoreName(storeIdx) {
  const sql = `
  SELECT store_name FROM STORE
  WHERE store_idx = ?
  `;

  const result = await mysql.query(sql, [storeIdx]);

  return result;
}

// Store rank N개 가져오기
async function selectStoreRank(lastIndex) {
  const sql = `
  SELECT 
  store_idx,
  store_name,
  store_img,
  store_url,
  store_ratingsum / store_review_cnt as store_rating,
  store_review_cnt

  FROM STORE

  WHERE store_idx > ?

  ORDER BY store_rank_score DESC, store_name

  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [lastIndex]);

  return result;
}

// Store의 hashtag 가져오기
async function selectStoreHashtag(storeIdx) {
  const sql = `
  SELECT
  store_hashtag_name

  FROM STORE_HASHTAG

  WHERE store_idx = ?
  `;

  const result = await mysql.query(sql, [storeIdx]);

  return result;
}

// userIdx가 스크랩한 StoreIdx 가져오기
async function getUserScrapStoreIdx(userIdx, lastIndex) {
  const sql = `
  SELECT
  store_idx

  FROM STORE_SCRAP

  WHERE user_idx = ? AND store_idx > ?

  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [userIdx, lastIndex]);

  return result;
}

// userIdx가 스크랩한 Store N개 가져오기
async function selectStoreScrap(userIdx, lastIndex) {
  const sql = `
  SELECT 
  S.store_idx,
  store_name,
  store_img,
  store_url,
  store_ratingsum / store_review_cnt as store_rating,
  store_review_cnt

  FROM STORE S, STORE_SCRAP C

  WHERE
  S.store_idx = C.store_idx
  AND C.user_idx = ?
  AND S.store_idx > ? 

  ORDER BY store_rank_score DESC, store_name

  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [userIdx, lastIndex]);

  return result;
}

async function insertStoreScrap(storeIdx, userIdx) {
  const sql = `
  INSERT INTO STORE_SCRAP
  (store_idx, user_idx)
  VALUES
  (?, ?)
  `;

  await mysql.query(sql, [storeIdx, userIdx]);
}

module.exports = {
  selectStoreName,
  selectStoreRank,
  selectStoreHashtag,
  getUserScrapStoreIdx,
  selectStoreScrap,
  insertStoreScrap,
};
