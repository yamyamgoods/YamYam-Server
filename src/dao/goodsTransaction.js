const mysql = require('../library/mysql');

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

async function insertGoodsScrapTransaction(userId, goodsIdx, goodsScrapPrice, label, options) {
  await mysql.transaction(async (connection) => {
    const result = await insertGoodsScrap(connection, userId, goodsIdx, goodsScrapPrice, label);
    const goodsScrapIdx = result.insertId;

    await insertUserScrapOption(connection, goodsScrapIdx, options);

    // const keyArr = Object.keys(options);
    // const valueArr = Object.values(options);
    // const keyArrLength = keyArr.length;

    // for (let i = 0; i < keyArrLength; i++) {
    //
    // }
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

async function insertGoodsTransaction(goodsName, storeIdx, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, categoryIdx, imgArr, optionArr) {
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

async function insertReviewCommentTransaction(userIdx, reviewIdx, contents, recommentFlag) {
  await mysql.transaction(async (connection) => {
    let alarmMessage;
    let commentIdx;

    if (!recommentFlag) {
      const reviewComment = await insertReviewComment(connection, userIdx, reviewIdx, contents);
      commentIdx = reviewComment.insertId;

      alarmMessage = `리뷰에 댓글이 달렸습니다. : ${contents}`;
    } else {
      const reviewRecomment = await insertReviewRecomment(connection, userIdx, reviewIdx, contents, 1);
      commentIdx = reviewRecomment.insertId;

      alarmMessage = `댓글에 답글이 달렸습니다. : ${contents}`;
    }

    await insertAlarm(connection, userIdx, 'GOODS_REVIEW_COMMENT', commentIdx, alarmMessage);
  });
}

module.exports = {
  insertGoodsScrapTransaction,
  insertGoodsTransaction,
  insertReviewCommentTransaction,
};
