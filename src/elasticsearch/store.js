const { paginationCnt } = require('../../config/elasticsearchConfig');
const { esClient } = require('./elasticsearch');

async function getStoreByStoreName(searchAfter, storeName, order) {
  const body = {};

  let sort;
  if (order == '인기순') {
    sort = [{ store_rank_score: 'desc' }];
  }

  sort.push({
    store_idx: 'asc',
  });

  body.sort = sort;

  if (searchAfter != -1) {
    body.search_after = searchAfter;
  }

  body.query = {
    term: {
      store_name: storeName,
    },
  };

  const response = await esClient.search({
    size: paginationCnt,
    index: 'store',
    body,
  });

  const result = {};
  result.store = [];

  const hits = response.hits.hits;
  const hitsLength = hits.length;
  for (let i = 0; i < hitsLength; i++) {
    const obj = {};

    obj.search_after = hits[i].sort;
    obj.store_idx = hits[i]._source.store_idx;
    obj.store_name = hits[i]._source.store_name;
    obj.store_rating = hits[i]._source.store_rating;
    obj.store_review_cnt = hits[i]._source.store_review_cnt;
    obj.store_img = hits[i]._source.store_img;
    obj.hash_tag = hits[i]._source.hash_tag;

    result.store.push(obj);
  }

  result.totalCnt = response.hits.total.value;
  
  return result;
}

module.exports = {
  getStoreByStoreName,
};
