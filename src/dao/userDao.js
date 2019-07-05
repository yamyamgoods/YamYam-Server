const mysql = require('../library/mysql');
const mysqlConfig = require('../../config/mysqlConfig');

async function selectUserWithGoods(userId, goodsId) {
  const sql = `
    SELECT *
    FROM GOODS_SCRAP
    WHERE user_idx = ? AND goods_idx = ?
    `;

  const result = await mysql.query(sql, [userId, goodsId]);

  return result;
}

async function selectFirstGoodsScrap(userIdx) {
  const sql = `
  SELECT 
  GOODS.goods_idx as goods_idx,
  store_idx,
  goods_scrap_price,
  goods_scrap_idx,
  goods_scrap_label
  FROM GOODS_SCRAP
  JOIN
  GOODS
  ON GOODS_SCRAP.goods_idx = GOODS.goods_idx
  WHERE GOODS_SCRAP.user_idx = ?
  ORDER BY goods_scrap_idx DESC
  LIMIT ${mysqlConfig.paginationCnt} 
  `;

  const result = await mysql.query(sql, [userIdx]);

  return result;
}

async function selectNextGoodsScrap(userIdx, lastIndex) {
  const sql = `
  SELECT 
  GOODS.goods_idx as goods_idx,
  store_idx,
  goods_scrap_price,
  goods_scrap_idx,
  goods_scrap_label
  FROM GOODS_SCRAP
  JOIN
  GOODS
  ON GOODS_SCRAP.goods_idx = GOODS.goods_idx
  WHERE GOODS_SCRAP.user_idx = ? AND goods_scrap_idx < ?
  ORDER BY goods_scrap_idx DESC
  LIMIT ${mysqlConfig.paginationCnt} 
  `;

  const result = await mysql.query(sql, [userIdx, lastIndex]);

  return result;
}

async function selectUserScrapOption(goodsScrapIdx) {
  const sql = `
  SELECT goods_scrap_option
  FROM USER_SCRAP_OPTION
  WHERE goods_scrap_idx = ?
  `;

  const result = await mysql.query(sql, [goodsScrapIdx]);

  return result;
}

async function selectUser(userIdx) {
  const sql = `
  SELECT 
  user_idx,
  user_email,
  user_name,
  user_img,
  user_point,
  user_alarm_cnt,
  refresh_token,
  device_token
  FROM USER 
  WHERE user_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx]);

  return result;
}

module.exports = {
  selectUserWithGoods,
  selectFirstGoodsScrap,
  selectNextGoodsScrap,
  selectUserScrapOption,
  selectUser,
};
