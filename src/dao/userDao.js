const mysql = require('../library/mysql');

async function selectUserWithGoods(userId, goodsId) {
  const sql = `
    SELECT *
    FROM GOODS_SCRAP
    WHERE user_idx = ? AND goods_idx = ?
    `;

  const result = await mysql.query(sql, [userId, goodsId]);

  return result;
}

module.exports = {
  selectUserWithGoods,
};
