const storeDao = require('../dao/storeDao');
const goodsDao = require('../dao/goodsDao');
const storeTransaction = require('../dao/storeTransaction');
const { s3Location } = require('../../config/s3Config');

// 단일 키 객체 => 값 배열
function parseObj(dataArr, attr) {
  const res = [];

  for (let i = 0; i < dataArr.length; i++) {
    res.push(dataArr[i][attr]);
  }

  return res;
}

async function getStoreRank(userIdx, lastIndex, storeCategoryIdx) {
  // idx, name, img, url, rating, review_cnt
  const store = await storeDao.selectStoreRank(lastIndex, storeCategoryIdx);

  const storeLength = store.length;
  let scrapStoreIdx;
  if (userIdx != 0) {
    scrapStoreIdx = await storeDao.getUserScrapStoreIdx(userIdx, lastIndex);
    scrapStoreIdx = parseObj(scrapStoreIdx, 'store_idx');
  }

  for (let i = 0; i < storeLength; i++) {
    // img s3Location concat
    store[i].store_img = s3Location + store[i].store_img;

    // hashtags
    store[i].store_hashtags = await storeDao.selectStoreHashtag(store[i].store_idx) || [];
    store[i].store_hashtags = parseObj(store[i].store_hashtags, 'store_hashtag_name');
    // scrap_flag
    if (userIdx != 0) {
      store[i].store_scrap_flag = scrapStoreIdx.includes(store[i].store_idx);
    }
  }
  return store;
}

async function getStoreScrap(userIdx, lastIndex, storeCategoryIdx) {
  // idx, name, img, url, rating, review_cnt
  const store = await storeDao.selectStoreScrap(userIdx, lastIndex, storeCategoryIdx);

  const storeLength = store.length;
  for (let i = 0; i < storeLength; i++) {
    // img s3Location concat
    store[i].store_img = s3Location + store[i].store_img;

    // hashtags
    store[i].store_hashtags = await storeDao.selectStoreHashtag(store[i].store_idx) || [];
    store[i].store_hashtags = parseObj(store[i].store_hashtags, 'store_hashtag_name');
  }
  return store;
}

async function addStoreScrap(storeIdx, userIdx) {
  const chkScrap = await storeDao.selectUserScrapWithStoreIdx(storeIdx, userIdx);
  if (chkScrap.length == 0) {
    await storeDao.insertStoreScrap(storeIdx, userIdx);
  }
}

async function removeStoreScrap(storeIdx, userIdx) {
  await storeDao.deleteStoreScrap(storeIdx, userIdx);
}

async function getStoreGoodsCategory(storeIdx) {
  // [{'goods_category_idx':1, 'goods_category_name':'asd'}, ...]
  const category = await goodsDao.selectStoreGoodsCategory(storeIdx);

  return category;
}

async function getStoreCategory() {
  // [{'store_category_idx':1, 'store_category_name':'asd'}, ...]
  const category = await storeDao.selectStoreCategory();

  return category;
}

async function getStoreGoods(userIdx, storeIdx, order, lastIndex, goodsCategoryIdx) {
  // [{'goods_idx': 1, 'goods_img': 'http://~~', 'goods_name':'asd', 'goods_price': 32900, 'goods_rating':3.2, 'goods_minimum_amount':10, 'goods_review_cnt': 300 [goods_like_flag: true]}, ...]
  const goods = await goodsDao.selectStoreGoods(storeIdx, order, lastIndex, goodsCategoryIdx);

  let scrapGoods;
  if (userIdx) scrapGoods = await goodsDao.selectGoodsScrapWithUserIdx(userIdx);

  const goodsLength = goods.length;

  for (let i = 0; i < goodsLength; i++) {
    // add first img url (thumnail)
    goods[i].goods_img = await goodsDao.selectFirstGoodsImg(goods[i].goods_idx) || '';
    goods[i].goods_img = s3Location + parseObj(goods[i].goods_img, 'goods_img')[0];

    // add like flag
    if (userIdx) {
      goods[i].goods_like_flag = scrapGoods.includes(goods[i].goods_idx);
    }
  }

  return goods;
}

async function addStore(file, name, url, hashTag, categoryName) {
  const img = file.location.split(s3Location)[1];

  await storeTransaction.insertStoreTransaction(img, name, url, hashTag, categoryName);
}

module.exports = {
  getStoreRank,
  getStoreScrap,
  addStoreScrap,
  removeStoreScrap,
  getStoreGoodsCategory,
  getStoreCategory,
  getStoreGoods,
  addStore,
};
