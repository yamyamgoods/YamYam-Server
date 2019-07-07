const { paginationCnt } = require('../../config/elasticsearchConfig');
const { esClient } = require('./elasticsearch');

async function getGoodsByGoodsName(searchAfter, goodsName, order) {
  const body = {};

  let sort;
  if (order == '인기순') {
    sort = [{ goods_score: 'desc' }];
  } else if (order == '낮은 가격순') {
    sort = [{ goods_price: 'asc' }];
  } else if (order == '높은 가격순') {
    sort = [{ goods_price: 'desc' }];
  }
  sort.push({
    goods_idx: 'asc',
  });

  body.sort = sort;

  if (searchAfter != -1) {
    body.search_after = searchAfter;
  }

  body.query = {
    term: {
      goods_name: goodsName,
    },
  };

  const response = await esClient.search({
    size: paginationCnt,
    index: 'goods',
    body,
  });

  const result = {};
  result.goods = [];

  const hits = response.hits.hits;
  const hitsLength = hits.length;
  for (let i = 0; i < hitsLength; i++) {
    const obj = {};

    obj.search_after = hits[i].sort;
    obj.goods_idx = hits[i]._source.goods_idx;
    obj.goods_name = hits[i]._source.goods_name;
    obj.goods_rating = hits[i]._source.goods_rating;
    obj.goods_price = hits[i]._source.goods_price;
    obj.goods_minimum_amount = hits[i]._source.goods_minimum_amount;
    obj.goods_detail = hits[i]._source.goods_detail;
    obj.goods_review_cnt = hits[i]._source.goods_review_cnt;
    obj.goods_img = hits[i]._source.goods_img;
    obj.store_name = hits[i]._source.store_name;

    result.goods.push(obj);
  }

  result.totalCnt = response.hits.total.value;

  return result;
}

module.exports = {
  getGoodsByGoodsName,
};
