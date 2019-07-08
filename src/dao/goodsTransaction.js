const mysql = require('../library/mysql');
const elasticsearchGoods = require('../elasticsearch/goods');

async function insertGoodsScrap(connection, userId, goodsIdx, goodsScrapPrice, goodsScrapLabel) {
  const sql = `
    INSERT INTO GOODS_SCRAP
    (user_idx, goods_idx, goods_scrap_label, goods_scrap_price, goods_scrap_option_flag)
    VALUES
    (?, ?, ?, ?, ?)
    `;

  const result = await connection.query(sql, [userId, goodsIdx, goodsScrapLabel, goodsScrapPrice, 1]);

  return result;
}

async function insertUserScrapOption(connection, goodsScrapIdx, options) {
  const sql = `
  INSERT INTO USER_SCRAP_OPTION
  (goods_scrap_idx, goods_scrap_option)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [goodsScrapIdx, options]);
}

async function updateGoodsScrapCnt(connection, goodsIdx) {
  const sql = `
  UPDATE GOODS SET goods_scrap_cnt = goods_scrap_cnt + 1 WHERE goods_idx = ?
  `;

  await connection.query(sql, [goodsIdx]);
}

async function insertGoodsScrapTransaction(userId, goodsIdx, goodsScrapPrice, label, options) {
  await mysql.transaction(async (connection) => {
    const result = await insertGoodsScrap(connection, userId, goodsIdx, goodsScrapPrice, label);
    const goodsScrapIdx = result.insertId;

    await insertUserScrapOption(connection, goodsScrapIdx, options);

    // GOODS SCRAP CNT+1
    await updateGoodsScrapCnt(connection, goodsIdx);
  });
}

async function insertGoods(connection, goodsName, storeIdx, price, categoryIdx, deliveryCharge, deliveryPeriod, minimumAmount, detail) {
  const sql = `
  INSERT INTO GOODS
  (store_idx, goods_category_idx, goods_name, goods_price, goods_delivery_charge, goods_delivery_period, goods_minimum_amount, goods_detail)
  VALUES
  (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await connection.query(sql, [storeIdx, categoryIdx, goodsName, price, deliveryCharge, deliveryPeriod, minimumAmount, detail]);

  return result;
}

async function insertGoodsOption(connection, optionName, goodsIdx) {
  const sql = `
  INSERT INTO GOODS_OPTION
  (goods_option_name, goods_idx)
  VALUES
  (?, ?)
  `;

  const result = await connection.query(sql, [optionName, goodsIdx]);

  return result;
}

async function insertGoodsOptionDetail(connection, optionIdx, optionDetailName, optionDetailPrice) {
  const sql = `
  INSERT INTO GOODS_OPTION_DETAIL
  (goods_option_idx, goods_option_detail_name, goods_option_detail_price)
  VALUES
  (?, ?, ?)
  `;

  await connection.query(sql, [optionIdx, optionDetailName, optionDetailPrice]);
}

async function insertGoodsImg(connection, goodsIdx, goodsImg) {
  const sql = `
  INSERT INTO GOODS_IMG
  (goods_idx, goods_img)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [goodsIdx, goodsImg]);
}

async function insertGoodsCategoryOptionDetailGoods(connection, goodsIdx, goodsCategoryOptionDetailIdx) {
  const sql = `
  INSERT INTO GOODS_CATEGORY_OPTION_DETAIL_GOODS
  (goods_idx, goods_category_option_detail_idx)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [goodsIdx, goodsCategoryOptionDetailIdx]);
}

async function selectGoodsDate(connection, goodsIdx) {
  const sql = `
  SELECT goods_date FROM GOODS WHERE goods_idx = ?
  `;

  const result = await connection.query(sql, [goodsIdx]);

  return result;
}

async function insertGoodsTransaction(goodsName, storeIdx, storeName, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, categoryIdx, imgArr, optionArr, goodsCategoryOptionDetailIdx) {
  await mysql.transaction(async (connection) => {
    // 굿즈 등록
    const goods = await insertGoods(connection, goodsName, storeIdx, price, categoryIdx, deliveryCharge, deliveryPeriod, minimumAmount, detail);
    const goodsIdx = goods.insertId;

    // 옵션 등록
    const optionArrLength = optionArr.length;
    for (let i = 0; i < optionArrLength; i++) {
      // 옵션 등록
      const goodsOption = await insertGoodsOption(connection, optionArr[i].optionName, goodsIdx);
      const goodsOptionIdx = goodsOption.insertId;

      // 옵션 상세 등록
      const optionDetailLength = optionArr[i].optionDetail.length;

      for (let j = 0; j < optionDetailLength; j++) {
        await insertGoodsOptionDetail(connection, goodsOptionIdx, optionArr[i].optionDetail[j].optionName, optionArr[i].optionDetail[j].optionPrice);
      }
    }

    // 이미지 등록
    const imgArrLength = imgArr.length;
    for (let i = 0; i < imgArrLength; i++) {
      await insertGoodsImg(connection, goodsIdx, imgArr[i]);
    }

    await insertGoodsCategoryOptionDetailGoods(connection, goodsIdx, goodsCategoryOptionDetailIdx);

    // 등록한 굿즈 시간 가져오기
    const goodsDateArr = await selectGoodsDate(connection, goodsIdx);
    const goodsDate = goodsDateArr[0].goods_date;

    // ElasticSearch Goods 등록
    await elasticsearchGoods.addGoods(goodsIdx, goodsName, goodsDate, storeIdx, storeName, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, imgArr);
  });
}

// 굿즈 리뷰 댓글 달기
async function insertReviewComment(connection, userIdx, reviewIdx, contents) {
  const sql = `
  INSERT INTO GOODS_REVIEW_COMMENT
  (goods_review_idx, user_idx, goods_review_cmt_content)
  VALUES
  (?, ?, ?)
  `;

  const result = await connection.query(sql, [reviewIdx, userIdx, contents]);

  return result;
}

// 굿즈 리뷰 댓글 달기(대댓글)
async function insertReviewRecomment(connection, userIdx, reviewIdx, contents, recommentFlag) {
  const sql = `
  INSERT INTO GOODS_REVIEW_COMMENT
  (goods_review_idx, user_idx, goods_review_cmt_content, goods_review_recmt_flag)
  VALUES
  (?, ?, ?, ?)
  `;

  const result = await connection.query(sql, [reviewIdx, userIdx, contents, recommentFlag]);

  return result;
}

async function insertAlarm(connection, userIdx, target, targetIdx, alarmMessage) {
  const sql = `
  INSERT INTO ALARM
  (user_idx, alarm_target, alarm_target_idx, alarm_message)
  VALUES
  (?, ?, ?, ?)
  `;

  await connection.query(sql, [userIdx, target, targetIdx, alarmMessage]);
}

async function updateUserAlarmCnt(connection, userIdx) {
  const sql = `
  UPDATE USER
  SET user_alarm_cnt = user_alarm_cnt + 1
  WHERE user_idx = ?
  `;

  await connection.query(sql, [userIdx]);
}

async function updateGoodsReviewCmtCnt(connection, reviewIdx, value) {
  const sql = `
  UPDATE GOODS_REVIEW SET goods_review_cmt_count = goods_review_cmt_count + ?
  WHERE goods_review_idx = ?
  `;

  await connection.query(sql, [value, reviewIdx]);
}

async function insertReviewCommentTransaction(userIdx, userIdxForAlarm, reviewIdx, contents, recommentFlag) {
  await mysql.transaction(async (connection) => {
    let alarmMessage;
    let commentIdx;

    if (recommentFlag) {
      const reviewComment = await insertReviewComment(connection, userIdx, reviewIdx, contents);
      commentIdx = reviewComment.insertId;

      alarmMessage = `리뷰에 댓글이 달렸습니다. : ${contents}`;
    } else {
      const reviewRecomment = await insertReviewRecomment(connection, userIdx, reviewIdx, contents, 1);
      commentIdx = reviewRecomment.insertId;

      alarmMessage = `댓글에 답글이 달렸습니다. : ${contents}`;
    }

    await insertAlarm(connection, userIdxForAlarm, 'GOODS_REVIEW_COMMENT', commentIdx, alarmMessage);
    await updateUserAlarmCnt(connection, userIdxForAlarm);

    // 굿즈 리뷰의 댓글 수 증가
    await updateGoodsReviewCmtCnt(connection, reviewIdx, 1);
  });
}

async function deleteReviewComment(connection, commentIdx) {
  const sql = `
  DELETE FROM GOODS_REVIEW_COMMENT
  WHERE goods_review_cmt_idx = ?
  `;

  await connection.query(sql, [commentIdx]);
}

async function deleteReviewCommentTransaction(reviewIdx, commentIdx) {
  await mysql.transaction(async (connection) => {
    await deleteReviewComment(connection, commentIdx);
    await updateGoodsReviewCmtCnt(connection, reviewIdx, -1);
  });
}

async function updateAllGoodsSrapCnt(connection, value) {
  const sql = `
  UPDATE GOODS SET goods_scrap_cnt = ?
  `;

  await connection.query(sql, [value]);
}

async function updateAllGoodsReviewWeekCnt(connection, value) {
  const sql = `
  UPDATE GOODS SET goods_review_week_cnt = ?
  `;

  await connection.query(sql, [value]);
}

async function updateAllGoodsRank(connection) {
  const sql = `
  UPDATE GOODS SET goods_score = goods_review_week_cnt + goods_scrap_cnt;
  `;

  await connection.query(sql);
}

async function selectGoods(connection) {
  const sql = `
  SELECT goods_idx, goods_score FROM GOODS
  `;

  const result = await connection.query(sql);

  return result;
}

async function calculateGoodsRankTransaction() {
  await mysql.transaction(async (connection) => {
    await updateAllGoodsRank(connection);
    await updateAllGoodsSrapCnt(connection, 0);
    await updateAllGoodsReviewWeekCnt(connection, 0);

    const goodsArr = await selectGoods(connection);
    const goodsArrLength = goodsArr.length;

    for (let i = 0; i < goodsArrLength; i++) {
      const goodsIdx = goodsArr[i].goods_idx;
      const goodsScore = goodsArr[i].goods_score;

      await elasticsearchGoods.updateGoodsScore(goodsIdx, goodsScore);
    }
  });
}

async function insertReviewLike(connection, userIdx, reviewIdx) {
  const sql = `
  INSERT INTO GOODS_REVIEW_LIKE
  (user_idx, goods_review_idx)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [userIdx, reviewIdx]);
}

async function updateGoodsReviewLikeCnt(connection, reviewIdx, value) {
  const sql = `
  UPDATE GOODS_REVIEW SET goods_review_like_count = goods_review_like_count + ?
  WHERE goods_review_idx = ?
  `;

  await connection.query(sql, [value, reviewIdx]);
}

async function deleteReviewLike(connection, userIdx, reviewIdx) {
  const sql = `
  DELETE FROM GOODS_REVIEW_LIKE
  WHERE user_idx = ? AND goods_review_idx = ?
  `;

  await connection.query(sql, [userIdx, reviewIdx]);
}

async function insertReviewLikeTransaction(userIdx, reviewIdx) {
  await mysql.transaction(async (connection) => {
    await insertReviewLike(connection, userIdx, reviewIdx);
    await updateGoodsReviewLikeCnt(connection, reviewIdx, 1);
  });
}

async function deleteReviewLikeTransaction(userIdx, reviewIdx) {
  await mysql.transaction(async (connection) => {
    await deleteReviewLike(connection, userIdx, reviewIdx);
    await updateGoodsReviewLikeCnt(connection, reviewIdx, -1);
  });
}

module.exports = {
  insertGoodsScrapTransaction,
  insertGoodsTransaction,
  insertReviewCommentTransaction,
  calculateGoodsRankTransaction,
  insertReviewLikeTransaction,
  deleteReviewLikeTransaction,
  deleteReviewCommentTransaction,
};
