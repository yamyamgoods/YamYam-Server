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
async function selectGoodsImg(goodsId) {
  const sql = `
  SELECT * FROM GOODS_IMG
  WHERE goods_idx = ?
  ORDER BY goods_img_idx ASC
  `;

  const result = await mysql.query(sql, [goodsId]);

  return result;
}

module.exports = {
  selectFirstBestGoods,
  selectNextBestGoods,
  selectGoodsImg,
};
