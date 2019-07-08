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
  SELECT goods_scrap_option,
  goods_scrap_option_idx
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
  device_token,
  admin
  FROM USER 
  WHERE user_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx]);

  return result;
}

async function selectUserByUserId(userId) {
  const sql = `
  SELECT 
  user_idx,
  user_email,
  user_name,
  user_img,
  user_point,
  user_alarm_cnt,
  refresh_token,
  device_token,
  admin,
  user_id
  FROM USER 
  WHERE user_id = ?
  `;

  const result = await mysql.query(sql, [userId]);

  return result;
}

async function getRefreshToken(userIdx) {
  const sql = `
  SELECT refresh_token
  FROM USER 
  WHERE user_idx = ?
  `;

  const result = await mysql.query(sql, [userIdx]);

  return result;
}

async function updateRefreshToken(userIdx, newRefreshToken) {
  const sql = `
  UPDATE USER 
  SET refresh_token = ?
  WHERE user_idx = ?
  `;

  await mysql.query(sql, [newRefreshToken, userIdx]);
}

async function selectUserIdxByCommentIdx(commentIdx) {
  const sql = `
  SELECT user_idx
  FROM GOODS_REVIEW_COMMENT
  WHERE goods_review_cmt_idx = ?
  `;

  const result = await mysql.query(sql, [commentIdx]);

  return result;
}

async function selectNextUserRecentGoods(userIdx, lastIndex) {
  const sql = `
  SELECT
  urg.user_recent_goods_idx,
  g.goods_idx,
  g.goods_name,
  g.goods_price,
  g.store_idx
  FROM USER_RECENT_GOODS urg, GOODS g
  WHERE urg.user_idx = ?
  AND urg.goods_idx = g.goods_idx
  AND urg.user_recent_goods_idx < ?
  ORDER BY urg.user_recent_goods_date_time DESC
  LIMIT ${mysqlConfig.paginationCnt} 
  `;
  const result = await mysql.query(sql, [userIdx, lastIndex]);
  return result;
}

async function selectFirstUserRecentGoods(userIdx) {
  const sql = `
  SELECT
  urg.user_recent_goods_idx,
  g.goods_idx,
  g.goods_name,
  g.goods_price,
  g.store_idx
  FROM USER_RECENT_GOODS urg, GOODS g
  WHERE urg.user_idx = ?
  AND urg.goods_idx = g.goods_idx
  ORDER BY urg.user_recent_goods_date_time DESC
  LIMIT ${mysqlConfig.paginationCnt} 
  `;
  const result = await mysql.query(sql, [userIdx]);
  return result;
}

async function selectFirstUserAlarm(userIdx) {
  const sql = `
  SELECT 
  a.alarm_idx,
  a.alarm_target_idx,
  a.alarm_date_time,
  a.alarm_message
  FROM ALARM a
  WHERE a.user_idx = ?
  ORDER BY a.alarm_date_time DESC
  LIMIT ${mysqlConfig.paginationCnt} 
  `;
  const result = await mysql.query(sql, [userIdx]);
  return result;
}

async function selectNextUserAlarm(userIdx, lastIndex) {
  const sql = `
  SELECT 
  a.alarm_idx,
  a.alarm_target_idx,
  a.alarm_date_time,
  a.alarm_message
  FROM ALARM a
  WHERE a.user_idx = ?
  AND a.alarm_idx < ?
  ORDER BY a.alarm_date_time DESC
  LIMIT ${mysqlConfig.paginationCnt} 
  `;
  const result = await mysql.query(sql, [userIdx, lastIndex]);
  return result;
}

// 이거 없애도 되지 않을까,,,고민중,,,
async function selectAlarmFlag(userIdx) {
  const sql = `
  SELECT *
  FROM ALARM a
  WHERE a.user_idx = ?
  `;
  const result = await mysql.query(sql, [userIdx]);
  return result;
}

async function updateUserAlarmFlag(userIdx) {
  const sql = `
  UPDATE USER
  SET user_alarm_cnt = 0
  WHERE user_idx = ?
  `;
  const result = await mysql.query(sql, [userIdx]);
  return result;
}

async function selectReviewIdx(reviewCommentIdx) {
  const sql = `
  SELECT goods_review_idx
  FROM GOODS_REVIEW_COMMENT
  WHERE goods_review_cmt_idx = ?
  `;

  const result = await mysql.query(sql, [reviewCommentIdx]);
  return result;
}

async function selectAlarmCheckFlag(alarmIdx) {
  const sql = `
  SELECT alarm_check_flag
  FROM ALARM
  WHERE alarm_idx = ?
  `;

  const result = await mysql.query(sql, [alarmIdx]);
  return result;
}

async function updateAlarmCheckFlag(alarmIdx) {
  const sql = `
  UPDATE ALARM
  SET alarm_check_flag = 1
  WHERE alarm_idx = ?
  `;

  const result = await mysql.query(sql, [alarmIdx]);

  return result;
}

async function deleteAlarm() {
  const sql = `
  DELETE FROM ALARM
  `;

  await mysql.query(sql);
}

async function updateUserProfile(profileImg, userIdx) {
  const sql = `
  UPDATE USER
  SET user_img = ?
  WHERE user_idx = ?
  `;

  const result = await mysql.query(sql, [profileImg, userIdx]);
  return result;
}

async function selectGoodsIdxWithGoodsScrapIdx(goodsScrapIdx) {
  const sql = `
  SELECT
  goods_idx 
  FROM GOODS_SCRAP  
  WHERE goods_scrap_idx = ?
  `;

  const result = await mysql.query(sql, [goodsScrapIdx]);

  return result;
}

async function updateUserNickname(userName, userIdx) {
  const sql = `
  UPDATE USER
  SET user_name = ?
  WHERE user_idx = ?
  `;
  const result = await mysql.query(sql, [userName, userIdx]);
  
  return result;
}

module.exports = {
  selectUserWithGoods,
  selectFirstGoodsScrap,
  selectNextGoodsScrap,
  selectUserScrapOption,
  selectUser,
  updateRefreshToken,
  getRefreshToken,
  selectUserIdxByCommentIdx,
  selectNextUserRecentGoods,
  selectFirstUserRecentGoods,
  selectFirstUserAlarm,
  selectNextUserAlarm,
  selectAlarmFlag,
  updateUserAlarmFlag,
  selectReviewIdx,
  selectAlarmCheckFlag,
  updateAlarmCheckFlag,
  deleteAlarm,
  updateUserProfile,
  selectGoodsIdxWithGoodsScrapIdx,
  selectUserByUserId,
  updateUserNickname,
};
