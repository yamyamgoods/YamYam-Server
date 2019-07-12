const storeDao = require('./src/dao/storeDao');
const es = require('./src/elasticsearch/store');

async function test() {
  const store = await storeDao.selectAllStoreInfo();

  const storeLength = store.length;
  for (let i = 0; i < storeLength; i++) {
    const storeIdx = store[i].store_idx;
    const storeName = store[i].store_name;
    const img = store[i].store_img;

    const hashTag = await storeDao.selectStoreHashtag(storeIdx);

    let hashTagArr = [];
    for (let j = 0; j < hashTag.length; j++) {
      hashTagArr.push(hashTag[j].store_hashtag_name);
    }

    const storeUrl = store[i].store_url;

    await es.addStore(storeIdx, storeName, img, hashTagArr, storeUrl);
  }
}

test();
