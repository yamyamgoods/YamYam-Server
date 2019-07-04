const mysql = require('../library/mysql');
const mysqlConfig = require('../../config/mysqlConfig');

async function selectFirstGoodsScrap(userIdx) {
  const sql = `
  SELECT 
  GOODS.goods_idx as goods_idx,
  store_idx,
  goods_name,
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
  goods_name,
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

module.exports = {
  selectFirstGoodsScrap,
  selectNextGoodsScrap,
};
