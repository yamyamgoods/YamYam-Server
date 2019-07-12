const request = require('request-promise');
const moment = require('moment');
const userDao = require('../dao/userDao');
const goodsDao = require('../dao/goodsDao');
const storeDao = require('../dao/storeDao');
const userTransaction = require('../dao/userTransaction');
const errorResponseObject = require('../../config/errorResponseObject');
const { sign, getRefreshToken } = require('../library/jwtCheck');
const { makeReviewTimeString } = require('../library/changeTimeString');
const { s3Location } = require('../../config/s3Config');

async function getGoodsScrap(userIdx, lastIndex) {
  let goodsScrap;
  const result = [];

  if (lastIndex == -1) {
    goodsScrap = await userDao.selectFirstGoodsScrap(userIdx);
  } else {
    goodsScrap = await userDao.selectNextGoodsScrap(userIdx, lastIndex);
  }

  const goodsScrapLength = goodsScrap.length;
  for (let i = 0; i < goodsScrapLength; i++) {
    const goodsScrapObj = {};
    goodsScrapObj.goods_idx = goodsScrap[i].goods_idx;
    goodsScrapObj.goods_name = goodsScrap[i].goods_name;
    goodsScrapObj.goods_price = goodsScrap[i].goods_scrap_price;
    goodsScrapObj.goods_scrap_idx = goodsScrap[i].goods_scrap_idx;
    goodsScrapObj.goods_scrap_label = goodsScrap[i].goods_scrap_label;

    // 굿즈 첫번째 이미지 가져오기
    const goodsImg = await goodsDao.selectGoodsImg(goodsScrap[i].goods_idx);
    goodsScrapObj.goods_img = s3Location + goodsImg[0].goods_img;

    // 스토어 이름 가져오기
    const storeName = await storeDao.selectStoreName(goodsScrap[i].store_idx);
    goodsScrapObj.store_name = storeName[0].store_name;

    result.push(goodsScrapObj);
  }

  return result;
}

async function getGoodsScrapOption(goodsScrapIdx) {
  let goodsScrapOptionData;
  const goodsScrapOptionDataAll = [];

  const optionArr = await userDao.selectUserScrapOption(goodsScrapIdx);

  const goodsIdx = await userDao.selectGoodsIdxWithGoodsScrapIdx(goodsScrapIdx);

  const goodsOptionArr = await goodsDao.selectGoodsOption(goodsIdx[0].goods_idx);
  const goodsOptionLength = goodsOptionArr.length;
  for (let i = 0; i < goodsOptionLength; i++) {
    const tempObj = {};
    tempObj.goods_option_name = goodsOptionArr[i].goods_option_name;

    const goodsOptionIdx = goodsOptionArr[i].goods_option_idx;
    const goodsOptionDetailArr = await goodsDao.selectGoodsOptionDetail(goodsOptionIdx);
    const goodsOptionDetailLength = goodsOptionDetailArr.length;

    tempObj.goods_option_detail = [];

    for (let k = 0; k < goodsOptionDetailLength; k++) {
      const goodsOptionDetailObject = {};
      goodsOptionDetailObject.goods_option_detail_name = goodsOptionDetailArr[k].goods_option_detail_name;
      goodsOptionDetailObject.goods_option_detail_price = goodsOptionDetailArr[k].goods_option_detail_price;

      tempObj.goods_option_detail.push(goodsOptionDetailObject);
    }

    goodsScrapOptionDataAll.push(tempObj);
  }

  if (optionArr.length != 0) {
    optionArr[0].goods_scrap_option = JSON.parse(optionArr[0].goods_scrap_option);
    goodsScrapOptionData = optionArr[0].goods_scrap_option;
  }

  // const optionNameArr = Object.keys(optionArr[0].goods_scrap_option);
  // const optionValueArr = Object.values(optionArr[0].goods_scrap_option);
  // const optionLength = optionNameArr.length;
  // for (let m = 0; m < optionLength; m++) {
  //   userScrapOptionData.push({
  //     optionName: optionNameArr[m],
  //     optionValue: optionValueArr[m],
  //   });
  // }

  // 굿즈 가격 가져오기
  const goodsArr = await goodsDao.selectGoods(goodsIdx[0].goods_idx);
  const goodsPrice = goodsArr[0].goods_price;

  return {
    goods_price: goodsPrice,
    goods_scrap_option_idx: optionArr[0].goods_scrap_option_idx,
    goods_scrap_option_data: goodsScrapOptionData,
    goods_option_data: goodsScrapOptionDataAll,
  };
}

async function getNewToken(refreshToken, userIdx) {
  let refreshTokenFromDB = await userDao.getRefreshToken(userIdx);
  refreshTokenFromDB = refreshTokenFromDB[0].refresh_token;

  if (refreshToken == refreshTokenFromDB) {
    const authorization = sign(userIdx);
    const newRefreshToken = getRefreshToken(userIdx);

    await userDao.updateRefreshToken(userIdx, newRefreshToken);

    return {
      authorization,
      refreshToken: newRefreshToken,
    };
  }

  throw errorResponseObject.refreshTokenError;
}

async function getUserInfo(userIdx) {
  const user = await userDao.selectUser(userIdx);

  const result = {};
  result.user_idx = user[0].user_idx;
  result.user_name = user[0].user_name;
  result.user_email = user[0].user_email;
  result.user_img = s3Location + user[0].user_img;
  result.user_point = user[0].user_point;

  if (user[0].user_alarm_cnt > 0) {
    result.alarm_flag = 1;
  } else {
    result.alarm_flag = 0;
  }

  return result;
}

async function getUserRecentGoods(userIdx, lastIndex) {
  const result = [];
  let userRecentGoods;
  if (lastIndex == -1) {
    userRecentGoods = await userDao.selectFirstUserRecentGoods(userIdx);
  } else {
    userRecentGoods = await userDao.selectNextUserRecentGoods(userIdx, lastIndex);
  }
  const userRecentGoodsLength = userRecentGoods.length;

  for (let i = 0; i < userRecentGoodsLength; i++) {
    const goodsIdx = userRecentGoods[i].goods_idx;
    const goodsStoreIdx = userRecentGoods[i].store_idx;
    delete userRecentGoods[i].store_idx;
    const user = await userDao.selectUserWithGoods(userIdx, goodsIdx);

    // 해당 굿즈의 스토어 이름 추가
    const storeName = await storeDao.selectStoreName(goodsStoreIdx);
    userRecentGoods[i].store_name = storeName[0].store_name;

    // 유저 즐겨찾기 flag 추가
    if (user.length === 0) {
      userRecentGoods[i].scrap_flag = 0;
    } else {
      userRecentGoods[i].scrap_flag = 1;
    }

    // 굿즈이미지 한개 골라서 추가
    const goodsImg = await goodsDao.selectGoodsImg(goodsIdx);
    userRecentGoods[i].goods_img = s3Location + goodsImg[0].goods_img;

    result.push(userRecentGoods[i]);
  }
  return result;
}

async function getUserAlarmList(userIdx, lastIndex) {
  const result = [];
  let userAlarmList;
  if (lastIndex == -1) {
    userAlarmList = await userDao.selectFirstUserAlarm(userIdx);
  } else {
    userAlarmList = await userDao.selectNextUserAlarm(userIdx, lastIndex);
  }
  const userAlarmListLength = userAlarmList.length;

  for (let i = 0; i < userAlarmListLength; i++) {
    const alarmTargetIdx = userAlarmList[i].alarm_target_idx;
    const reviewComments = await userDao.selectReviewIdx(alarmTargetIdx);
    userAlarmList[i].alarm_date_time = moment(userAlarmList[i].alarm_date_time).format('YYYY.MM.DD');
    userAlarmList[i].goods_review_idx = reviewComments[0].goods_review_idx;
    result.push(userAlarmList[i]);
  }
  await userDao.updateUserAlarmFlag(userIdx);
  return result;
}

async function getUserAlarmFlag(userIdx) {
  const result = [];
  const subResult = {};
  const user = await userDao.selectUser(userIdx);
  if (user[0].user_alarm_cnt > 0) {
    subResult.alarm_flag = 1;
  } else {
    subResult.alarm_flag = 0;
  }
  result.push(subResult);
  return result;
}

async function getAlarmReviewDetail(alarmIdx, reviewIdx) {
  const result = {};

  const goodsIdxArr = await goodsDao.selectGoodsIdxByReviewIdx(reviewIdx);
  const goodsIdx = goodsIdxArr[0].goods_idx;
  const goods = await goodsDao.selectGoods(goodsIdx);
  const goodsImg = await goodsDao.selectGoodsImg(goodsIdx);

  const alarmIdxArr = await userDao.selectAlarmCheckFlag(alarmIdx);
  if (alarmIdxArr[0].alarm_check_flag == 0) { // 0 이면 읽었다고 1로 업데이트 하기
    await userDao.updateAlarmCheckFlag(alarmIdx);
  }

  // 굿즈 데이터
  result.goods = {
    goods_idx: goods[0].goods_idx,
    goods_img: s3Location + goodsImg[0].goods_img,
    goods_name: goods[0].goods_name,
    goods_price: goods[0].goods_price,
    goods_rating: goods[0].goods_rating,
    store_name: goods[0].store_name,
  };

  const reviewComment = await goodsDao.selectFirstReviewComments(reviewIdx);

  const reviewCommentLength = reviewComment.length;
  for (let i = 0; i < reviewCommentLength; i++) {
    // 유저 정보 가져오기
    const userArr = await userDao.selectUser(reviewComment[i].user_idx);
    const user = userArr[0];

    reviewComment[i].user_name = user.user_idx;
    reviewComment[i].user_name = user.user_name;
    reviewComment[i].user_img = s3Location + user.user_img;

    // 시간 String 생성
    reviewComment[i]
      .goods_review_cmt_date = makeReviewTimeString(reviewComment[i].goods_review_cmt_date);
  }

  // 리뷰 댓글
  result.review_comment = reviewComment;
  return result;
}

async function modifyUserProfile(profileImg, userIdx) {
  let userImg;
  if (!profileImg) {
    userImg = '/user/defaultImg/user_img.png';
  } else {
    userImg = profileImg.split(s3Location)[1];
  }

  await userDao.updateUserProfile(userImg, userIdx);
}

async function kakaoSignin(accesstoken, devicetoken) {
  const option = {
    method: 'GET',
    uri: 'https://kapi.kakao.com/v2/user/me',
    json: true,
    headers: {
      Authorization: `Bearer ${accesstoken}`,
    },
  };

  const kakaoUserInfo = await request(option);

  // 데이터베이스에서 유저 유무 확인
  const user = await userDao.selectUserByUserId(`kakao/${kakaoUserInfo.id}`);

  let newToken;
  let refreshToken;
  // 유저가 있는 경우
  if (user.length != 0) {
    const userIdx = user[0].user_idx;

    newToken = sign(userIdx);
    refreshToken = getRefreshToken(userIdx);
    await userDao.updateRefreshToken(userIdx, refreshToken);
  } else {
    await userTransaction.insertKakaoUserTransaction(`kakao/${kakaoUserInfo.id}`, kakaoUserInfo.properties.nickname, devicetoken);

    const newUser = await userDao.selectUserByUserId(`kakao/${kakaoUserInfo.id}`);

    newToken = sign(newUser[0].user_idx);
    refreshToken = newUser[0].refresh_token;
  }

  return {
    authorization: newToken,
    refreshtoken: refreshToken,
  };
}

async function modifyUserNickname(userName, userIdx) {
  await userDao.updateUserNickname(userName, userIdx);
}

module.exports = {
  getGoodsScrap,
  getGoodsScrapOption,
  getNewToken,
  getUserInfo,
  getUserRecentGoods,
  getUserAlarmList,
  getUserAlarmFlag,
  getAlarmReviewDetail,
  modifyUserProfile,
  kakaoSignin,
  modifyUserNickname,
};
