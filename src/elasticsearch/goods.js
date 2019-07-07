const moment = require('moment');
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

async function addGoods(goodsIdx, goodsName, goodsDate, storeIdx, storeName, price, deliveryCharge, deliveryPeriod, minimumAmount, detail, imgArr) {
  const newGoodsDate = moment(goodsDate).format('YYYY-MM-DD HH:mm:ss');

  const body = {
    goods_idx: goodsIdx,
    goods_name: goodsName,
    goods_rating: 0,
    goods_price: price,
    goods_delivery_charge: deliveryCharge,
    goods_delivery_period: deliveryPeriod,
    goods_minimum_amount: minimumAmount,
    goods_detail: detail,
    goods_date: newGoodsDate,
    goods_review_cnt: 0,
    goods_img: imgArr,
    goods_score: 0,
    store_name: storeName,
  };

  await esClient.create({
    id: goodsIdx,
    index: 'goods',
    body,
  });
}

// ReviewCnt += 1
async function updateReviewCnt(goodsIdx) {
  const body = {};
  body.script = {
    source: 'ctx._source.goods_review_cnt++',
  };

  await esClient.update({
    id: goodsIdx,
    index: 'goods',
    body,
  });
}

async function updateGoodsRating(goodsIdx, goodsRating) {
  const body = {};
  body.script = {
    source: `ctx._source.goods_rating=${goodsRating}`,
  };

  await esClient.update({
    id: goodsIdx,
    index: 'goods',
    body,
  });
}

async function updateGoodsScore(goodsIdx, goodsScore) {
  const body = {};
  body.script = {
    source: `ctx._source.goods_score=${goodsScore}`,
  };

  await esClient.update({
    id: goodsIdx,
    index: 'goods',
    body,
  });
}

module.exports = {
  getGoodsByGoodsName,
  addGoods,
  updateReviewCnt,
  updateGoodsRating,
  updateGoodsScore,
};
