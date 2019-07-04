const storeDao = require('../dao/storeDao');
// const errorResponseObject = require('../../config/errorResponseObject');

// hashtag 문자열 객체 => 배열
function parseHashtags(dataArr) {
  const res = [];

  for (let i = 0; i < dataArr.length; i++) {
    res.push(dataArr[i].store_hashtag_name);
  }

  return res;
}

async function getStoreRank(userIdx, lastIndex) {
  // idx, name, img, url, rating, review_cnt
  const store = await storeDao.selectStoreRank(lastIndex);

  const storeLength = store.length;
  let scrapStoreIdx;
  if (userIdx != 0) {
    scrapStoreIdx = await storeDao.getUserScrapStoreIdx(userIdx);
  }

  for (let i = 0; i < storeLength; i++) {
    // hashtags
    store[i].store_hashtags = await storeDao.selectStoreHashtag(store[i].store_idx) || [];
    store[i].store_hashtags = parseHashtags(store[i].store_hashtags);
    // scrap_flag
    if (userIdx != 0) {
      store[i].store_scrap_flag = scrapStoreIdx.includes(store[i].store_idx);
    }
  }
  return store;
}

async function getStoreScrap(userId, lastIndex) {
  // idx, name, img, url, rating, review_cnt
  const store = await storeDao.selectStoreScrap(lastIndex);

  const storeLength = store.length;
  for (let i = 0; i < storeLength; i++) {
    // hashtags
    store[i].store_hashtags = await storeDao.selectStoreHashtag(store[i].store_idx) || [];
    console.log(parseHashtags(store[i].store_hashtags));
    Object.values(store[i].store_hashtags);
  }
  return store;
}

async function addStoreScrap(storeIdx, userIdx) {
  await storeDao.insertStoreScrap(storeIdx, userIdx);
}

module.exports = {
  getStoreRank,
  getStoreScrap,
  addStoreScrap,
};
