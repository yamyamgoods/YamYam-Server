const storeDao = require('../dao/storeDao');
// const errorResponseObject = require('../../config/errorResponseObject');

// 단일 키 객체 => 값 배열
function parseObj(dataArr, attr) {
  const res = [];

  for (let i = 0; i < dataArr.length; i++) {
    res.push(dataArr[i][attr]);
  }

  return res;
}

async function getStoreRank(userIdx, lastIndex) {
  // idx, name, img, url, rating, review_cnt
  const store = await storeDao.selectStoreRank(lastIndex);

  const storeLength = store.length;
  let scrapStoreIdx;
  if (userIdx != 0) {
    scrapStoreIdx = await storeDao.getUserScrapStoreIdx(userIdx, lastIndex);
    scrapStoreIdx = parseObj(scrapStoreIdx, 'store_idx');
  }

  for (let i = 0; i < storeLength; i++) {
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

async function getStoreScrap(userIdx, lastIndex) {
  // idx, name, img, url, rating, review_cnt
  const store = await storeDao.selectStoreScrap(userIdx, lastIndex);

  const storeLength = store.length;
  for (let i = 0; i < storeLength; i++) {
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
  const category = await storeDao.selectStoreGoodsCategory(storeIdx);

  return category;
}

async function getStoreCategory() {
  // [{'store_category_idx':1, 'store_category_name':'asd'}, ...]
  const category = await storeDao.selectStoreCategory();

  return category;
}

module.exports = {
  getStoreRank,
  getStoreScrap,
  addStoreScrap,
  removeStoreScrap,
  getStoreGoodsCategory,
  getStoreCategory,
};
