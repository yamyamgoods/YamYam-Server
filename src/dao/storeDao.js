const mysql = require('../library/mysql');

async function selectStoreName(storeIdx) {
  const sql = `
  SELECT store_name FROM STORE
  WHERE store_idx = ?
  `;

  const result = await mysql.query(sql, [storeIdx]);

  return result;
}

module.exports = {
  selectStoreName,
};
