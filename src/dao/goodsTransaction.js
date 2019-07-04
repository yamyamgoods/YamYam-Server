const mysql = require('../library/mysql');

async function insertGoodsScrap(connection, userId, goodsIdx, goodsScrapPrice, label) {
  const sql = `
    INSERT INTO GOODS_SCRAP
    (user_idx, goods_idx, goods_scrap_label, goods_scrap_price, goods_scrap_option_flag)
    VALUES
    (?, ?, ?, ?, ?)
    `;

  const result = await connection.query(sql, [userId, goodsIdx, label, goodsScrapPrice, 1]);

  return result;
}

async function insertUserScrapOption(connection, goodsScrapId, options) {
  const sql = `
  INSERT INTO USER_SCRAP_OPTION
  (goods_scrap_idx, goods_scrap_options)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [goodsScrapId, options]);
}

async function insertGoodsScrapTransaction(userId, goodsIdx, goodsScrapPrice, label, options) {
  await mysql.transaction(async (connection) => {
    const result = await insertGoodsScrap(connection, userId, goodsIdx, goodsScrapPrice, label);
    const goodsScrapId = result.insertId;

    await insertUserScrapOption(connection, goodsScrapId, options);

    // const keyArr = Object.keys(options);
    // const valueArr = Object.values(options);
    // const keyArrLength = keyArr.length;

    // for (let i = 0; i < keyArrLength; i++) {
    //
    // }
  });
}

module.exports = {
  insertGoodsScrapTransaction,
};
