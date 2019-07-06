const userDao = require('../dao/userDao');
const goodsDao = require('../dao/goodsDao');
const storeDao = require('../dao/storeDao');
const errorResponseObject = require('../../config/errorResponseObject');
const { sign, getRefreshToken } = require('../library/jwtCheck');

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
    goodsScrapObj.goods_price = goodsScrap[i].goods_scrap_price;
    goodsScrapObj.goods_scrap_idx = goodsScrap[i].goods_scrap_idx;
    goodsScrapObj.goods_scrap_label = goodsScrap[i].goods_scrap_label;

    // 굿즈 첫번째 이미지 가져오기
    const goodsImg = await goodsDao.selectGoodsImg(goodsScrap[i].goods_idx);
    goodsScrapObj.goods_img = goodsImg[0].goods_img;

    // 스토어 이름 가져오기
    const storeName = await storeDao.selectStoreName(goodsScrap[i].store_idx);
    goodsScrapObj.store_name = storeName[0].store_name;

    result.push(goodsScrapObj);
  }

  return result;
}

async function getUserScrapOption(goodsScrapIdx) {
  const result = [];
  const optionArr = await userDao.selectUserScrapOption(goodsScrapIdx);

  if (optionArr.length != 0) {
    optionArr[0].goods_scrap_option = JSON.parse(optionArr[0].goods_scrap_option);
  }

  const optionNameArr = Object.keys(optionArr[0].goods_scrap_option);
  const optionValueArr = Object.values(optionArr[0].goods_scrap_option);
  const optionLength = optionNameArr.length;
  for (let i = 0; i < optionLength; i++) {
    result.push({
      optionName: optionNameArr[i],
      optionValue: optionValueArr[i],
    });
  }

  return result;
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
  const result = [];
  const userInfoObject = {};
  userInfoObject.user_idx = user[0].user_idx;
  userInfoObject.user_name = user[0].user_name;
  userInfoObject.user_email = user[0].user_email;
  userInfoObject.user_img = user[0].user_img;
  userInfoObject.user_point = user[0].user_point;
  userInfoObject.user_alarm_cnt = user[0].user_alarm_cnt;

  result.push(userInfoObject);
  return result;
}

async function getUserRecentGoods(userIdx, lastIndex) {
  const result = [];
  const userRecentGoods = await userDao.selectUserRecentGoods(userIdx, lastIndex);
  const userRecentGoodsLength = userRecentGoods.length;

  for (let i = 0;i < userRecentGoodsLength; i++) {

    const goodsIdx = userRecentGoods[i].goods_idx;
    const goodsStoreIdx = userRecentGoods[i].store_idx;
    const user = await userDao.selectUserWithGoods(userIdx,goodsIdx);

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
    userRecentGoods[i].goods_img = goodsImg[0].goods_img;

    result.push(userRecentGoods[i]);
  }
  return result;
}

module.exports = {
  getGoodsScrap,
  getUserScrapOption,
  getNewToken,
  getUserInfo,
  getUserRecentGoods,
};
