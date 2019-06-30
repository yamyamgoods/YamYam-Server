// Database 관련 코드는 생략

async function selectUser(userId) {
  const sql = `
    SELECT * FROM user WHERE user_id = ?
    `;

  const userData = await conn.query(sql, [userId]);

  return userData;
}

module.exports = {
  selectUser,
};
