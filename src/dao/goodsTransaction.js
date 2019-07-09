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
  INSERT INTO GOODS_SCRAP_OPTION
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

async function insertGoodsCategoryOptionGoods(connection, goodsIdx, goodsCategoryOptionIdx) {
  const sql = `
  INSERT INTO GOODS_CATEGORY_OPTION_GOODS
  (goods_idx, goods_category_option_idx)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [goodsIdx, goodsCategoryOptionIdx]);
}

async function selectGoodsDate(connection, goodsIdx) {
  const sql = `
  SELECT goods_date FROM GOODS WHERE goods_idx = ?
  `;

  const result = await connection.query(sql, [goodsIdx]);

  return result;
}

async function insertGoodsTransaction(goodsName, storeIdx, storeName, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, categoryIdx, imgArr, optionArr, goodsCategoryOptionIdx) {
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

    await insertGoodsCategoryOptionGoods(connection, goodsIdx, goodsCategoryOptionIdx);

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

async function insertCategoryOption(connection, categoryIdx, categoryOptionName) {
  const sql = `
  INSERT INTO GOODS_CATEGORY_OPTION
  (goods_category_idx, goods_category_option_name)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [categoryIdx, categoryOptionName]);
}

async function insertCategoryOptionTransaction(categoryIdx, categoryOption) {
  await mysql.transaction(async (connection) => {
    const categoryOptionLength = categoryOption.length;
    for (let i = 0; i < categoryOptionLength; i++) {
      await insertCategoryOption(connection, categoryIdx, categoryOption[i]);
    }
  });
}

// insertGoodsReviewTransaction에서 사용하는 함수 네개
async function insertGoodsReview(connection, goodsIdx, userIdx, photoFlag, rating, content) {
  const sql = `
  INSERT INTO GOODS_REVIEW
  (goods_idx, user_idx, goods_review_photo_flag, goods_review_rating, goods_review_content)
  VALUES
  (?, ?, ?, ?, ?)
  `;

  return await connection.query(sql, [goodsIdx, userIdx, photoFlag, rating, content]);
}

async function insertGoodsReviewImg(connection, goodsReviewIdx, img) {
  const sql = `
  INSERT INTO GOODS_REVIEW_IMG
  (goods_review_idx, goods_review_img)
  VALUES
  (?, ?)
  `;

  await connection.query(sql, [goodsReviewIdx, img.key]);
}

async function updateGoodsRating(connection, cnt, rating, goodsIdx) {
  const sql = `
  UPDATE GOODS
  SET
  goods_review_cnt = goods_review_cnt + ?,
  goods_review_week_cnt = goods_review_week_cnt + ?,
  goods_ratingsum = goods_ratingsum + ?,
  goods_rating = goods_ratingsum / goods_review_cnt
  WHERE goods_idx = ?
  `;

  return await connection.query(sql, [cnt, cnt, parseFloat(rating), goodsIdx]);
}

async function updateStoreCnt(connection, cnt, storeIdx) {
  const sql = `
  UPDATE STORE
  SET store_review_cnt = store_review_cnt + ?
  WHERE store_idx = ?
  `;

  const result = await connection.query(sql, [cnt, storeIdx]);
}

async function getStoreIdxByGoodsIdx(connection, goodsIdx) {
  const sql = `
  SELECT store_idx
  FROM GOODS
  WHERE goods_idx = ?
  `;

  const result = await connection.query(sql, [goodsIdx]);

  return result[0];
}

async function selectGoodsRating(connection, goodsIdx) {
  const sql = `
  SELECT goods_rating FROM GOODS WHERE goods_idx = ?
  `;

  const result = await connection.query(sql, [goodsIdx]);

  return result;
}

async function insertGoodsReviewTransaction(goodsIdx, userIdx, rating, content, img) {
  await mysql.transaction(async (connection) => {
    let photoFlag = false;
    if (img) photoFlag = true;
    const reviewRow = await insertGoodsReview(connection, goodsIdx, userIdx, photoFlag, rating, content);

    if (img) {
      for (let i = 0; i < img.length; i++) {
        await insertGoodsReviewImg(connection, reviewRow.insertId, img[i]);
      }
    }

    await updateGoodsRating(connection, 1, rating, goodsIdx);

    const storeIdx = await getStoreIdxByGoodsIdx(connection, goodsIdx);

    await updateStoreCnt(connection, 1, storeIdx);

    const goodsRatingArr = await selectGoodsRating(connection, goodsIdx);
    const goodsRating = goodsRatingArr[0].goods_rating;

    // elasticsearch rankingscore
    // elasticsearch review cnt+1

    await elasticsearchGoods.updateReviewCntAndGoodsRating(goodsIdx, goodsRating);
  });
}

async function updateGoodsReview(connection, reviewIdx, photoFlag, rating, content) {
  const sql = `
  UPDATE GOODS_REVIEW
  SET goods_review_photo_flag = ?, goods_review_rating = ?, goods_review_content = ?
  WHERE goods_review_idx = ?
  `;

  return await connection.query(sql, [photoFlag, rating, content, reviewIdx]);
}

async function deleteGoodsReviewImg(connection, reviewIdx) {
  const sql = `
  DELETE FROM GOODS_REVIEW_IMG
  WHERE goods_review_idx = ?
  `;

  await connection.query(sql, [reviewIdx]);
}

async function selectGoodsReviewRating(connection, reviewIdx) {
  const sql = `
  SELECT goods_review_rating
  FROM GOODS_REVIEW
  WHERE goods_review_idx = ?
  `;

  const result = await connection.query(sql, [reviewIdx]);

  if (result != []) {
    return result[0].goods_review_rating;
  }
  throw new Error('Doesn\'t exist reviewIdx');
}

async function updateGoodsReviewTransaction(goodsIdx, reviewIdx, userIdx, rating, content, img) {
  await mysql.transaction(async (connection) => {
    const oldRating = await selectGoodsReviewRating(connection, reviewIdx);

    let photoFlag = false;
    if (img) photoFlag = true;

    await updateGoodsReview(connection, reviewIdx, photoFlag, rating, content);

    await deleteGoodsReviewImg(connection, reviewIdx);
    if (img) {
      for (let i = 0; i < img.length; i++) {
        await insertGoodsReviewImg(connection, reviewIdx, img[i]);
      }
    }

    await updateGoodsRating(connection, 0, rating - oldRating, goodsIdx);
  });
}

async function deleteGoodsReview(connection, reviewIdx, goodsIdx) {
  const sql = `
  DELETE FROM GOODS_REVIEW
  WHERE goods_review_idx = ? AND goods_idx = ?
  `;

  const result = await connection.query(sql, [reviewIdx, goodsIdx]);

  return result.affectedRows;
}

async function deleteGoodsReviewTransaction(goodsIdx, reviewIdx) {
  await mysql.transaction(async (connection) => {
    const oldRating = await selectGoodsReviewRating(connection, reviewIdx);

    const chkDelete = await deleteGoodsReview(connection, reviewIdx, goodsIdx);

    if (chkDelete == 0) {
      throw new Error('reviewIdx and goodsIdx don\'t match');
    } else {
      await deleteGoodsReviewImg(connection, reviewIdx);

      await updateGoodsRating(connection, -1, -oldRating, goodsIdx);

      const storeIdx = await getStoreIdxByGoodsIdx(connection, goodsIdx);

      await updateStoreCnt(connection, -1, storeIdx);
    }
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
  insertCategoryOptionTransaction,
  insertGoodsReview,
  insertGoodsReviewImg,
  updateGoodsRating,
  updateStoreCnt,
  insertGoodsReviewTransaction,
  updateGoodsReviewTransaction,
  deleteGoodsReviewTransaction,
};
