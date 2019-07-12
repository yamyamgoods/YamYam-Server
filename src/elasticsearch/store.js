const { paginationCnt } = require('../../config/elasticsearchConfig');
const { esClient } = require('./elasticsearch');

async function getStoreByStoreName(searchAfter, storeName, order) {
  const body = {};

  let sort;
  if (order == 0) {
    sort = [{ store_rank_score: 'desc' }];
  }

  sort.push({
    store_idx: 'asc',
  });

  body.sort = sort;

  if (searchAfter) {
    body.search_after = JSON.parse(searchAfter);
  }

  body.query = {
    term: {
      store_name: storeName,
    },
  };

  const response = await esClient.search({
    size: paginationCnt,
    index: 'yamyamstore',
    type: 'store',
    body,
  });

  const result = {};
  result.store = [];

  const hits = response.hits.hits;
  const hitsLength = hits.length;
  for (let i = 0; i < hitsLength; i++) {
    const obj = {};

    obj.search_after = JSON.stringify(hits[i].sort);
    obj.store_idx = hits[i]._source.store_idx;
    obj.store_name = hits[i]._source.store_name;
    obj.store_rating = hits[i]._source.store_rating;
    obj.store_img = hits[i]._source.store_img;
    obj.hash_tag = hits[i]._source.hash_tag;
    obj.store_url = hits[i]._source.store_url;

    result.store.push(obj);
  }

  result.totalCnt = response.hits.total;

  return result;
}

async function addStore(storeIdx, storeName, imgArr, hashTag, storeUrl) {
  const body = {
    store_idx: storeIdx,
    store_name: storeName,
    store_img: imgArr,
    hash_tag: hashTag,
    store_rank_score: 0,
    store_url: storeUrl,
  };

  await esClient.index({
    id: storeIdx,
    index: 'yamyamstore',
    type: 'store',
    body,
  });
}

async function updateStoreRankScore(storeIdx, storeRankScore) {
  const body = {};
  body.query = {
    match: {
      store_idx: storeIdx,
    },
  };
  body.script = {
    inline: `ctx._source.store_rank_score=${storeRankScore}`,
  };

  await esClient.updateByQuery({
    index: 'yamyamstore',
    type: 'store',
    body,
  });
}

module.exports = {
  getStoreByStoreName,
  addStore,
  updateStoreRankScore,
};
