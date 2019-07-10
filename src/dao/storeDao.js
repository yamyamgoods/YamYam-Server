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
async function selectStoreRank(lastIndex, storeCategoryIdx) {
  let sql = `
  SELECT 
  store_idx,
  store_name,
  store_img,
  store_url

  FROM STORE

  WHERE store_idx > ?`;

  if (storeCategoryIdx) {
    sql += `
      AND EXISTS (
        SELECT 1
        FROM STORE_CATEGORY_STORE
        WHERE STORE_CATEGORY_STORE.store_category_idx = ${storeCategoryIdx}
        AND STORE.store_idx = STORE_CATEGORY_STORE.store_idx
      )`;
  }
  sql += `
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

// userIdx가 스크랩한 StoreIdx 가져오기 (페이징)
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
async function selectStoreScrap(userIdx, lastIndex, storeCategoryIdx) {
  let sql = `
  SELECT 
  S.store_idx,
  store_name,
  store_img,
  store_url

  FROM STORE S, STORE_SCRAP C

  WHERE
  S.store_idx = C.store_idx
  AND C.user_idx = ?
  AND S.store_idx > ? `;

  if (storeCategoryIdx) {
    sql += `
    AND EXISTS (
      SELECT 1
      FROM STORE_CATEGORY_STORE
      WHERE STORE_CATEGORY_STORE.store_category_idx = ${storeCategoryIdx}
      AND S.store_idx = STORE_CATEGORY_STORE.store_idx
    )`;
  }

  sql += `
  ORDER BY store_rank_score DESC, store_name
  LIMIT ${mysqlConfig.paginationCnt}
  `;

  const result = await mysql.query(sql, [userIdx, lastIndex]);

  return result;
}

// userIdx가 storeIdx를 스크랩했는지
async function selectUserScrapWithStoreIdx(storeIdx, userIdx) {
  const sql = `
  SELECT store_scrap_idx
  FROM STORE_SCRAP
  WHERE store_idx = ? AND user_idx = ?
  `;

  const result = await mysql.query(sql, [storeIdx, userIdx]);

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

async function deleteStoreScrap(storeIdx, userIdx) {
  const sql = `
  DELETE FROM STORE_SCRAP
  WHERE store_idx = ? AND user_idx = ?
  `;

  await mysql.query(sql, [storeIdx, userIdx]);
}

async function selectStoreCategory() {
  const sql = `
  SELECT store_category_idx, store_category_name
  FROM STORE_CATEGORY
  `;

  const result = await mysql.query(sql);

  return result;
}

async function updateAllStoreRank() {
  const sql = `
  UPDATE STORE SET store_rank_score = store_scrap_cnt + store_hit;
  `;

  await mysql.query(sql);
}

async function updateAllStoreHit(value) {
  const sql = `
  UPDATE STORE SET store_hit = ?
  `;

  await mysql.query(sql, [value]);
}

async function updateAllStoreScrapCnt(value) {
  const sql = `
  UPDATE STORE SET store_scrap_cnt = ?
  `;

  await mysql.query(sql, [value]);
}

async function updateStoreHit(storeIdx) {
  const sql = `
  UPDATE STORE
  SET store_hit = store_hit + 1
  WHERE store_idx = ?
  `;

  await mysql.query(sql, [storeIdx]);
}

async function selectStore() {
  const sql = `
  SELECT store_idx, store_name
  FROM STORE
  `;

  const result = await mysql.query(sql);

  return result;
}

module.exports = {
  selectStoreName,
  selectStoreRank,
  selectStoreHashtag,
  getUserScrapStoreIdx,
  selectStoreScrap,
  selectUserScrapWithStoreIdx,
  insertStoreScrap,
  deleteStoreScrap,
  selectStoreCategory,
  updateAllStoreRank,
  updateAllStoreHit,
  updateAllStoreScrapCnt,
  updateStoreHit,
  selectStore,
};
