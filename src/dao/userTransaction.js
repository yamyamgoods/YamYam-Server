const mysql = require('../library/mysql');
const { sign, getRefreshToken } = require('../library/jwtCheck');

async function insertUser(connection, userId, name, deviceToken) {
  const sql = `
  INSERT INTO USER 
  (user_id, user_name, device_token, deviceToken)
  VALUES
  (?, ?, ?);
  `;

  const result = await connection.query(sql, [userId, name, deviceToken]);

  return result;
}

async function updateRefreshToken(connection, userIdx, refreshtoken) {
  const sql = `
  UPDATE USER 
  SET refresh_token = ?
  WHERE user_idx = ?
  `;

  await connection.query(sql, [refreshtoken, userIdx]);
}

async function insertKakaoUserTransaction(userId, name, deviceToken) {
  await mysql.transaction(async (connection) => {
    const newUser = await insertUser(connection, userId, name, deviceToken);
    const newUserIdx = newUser.insertId;

    const refreshToken = getRefreshToken(newUserIdx);

    updateRefreshToken(connection, newUserIdx, refreshToken);
  });
}

module.exports = {
  insertKakaoUserTransaction,
};
