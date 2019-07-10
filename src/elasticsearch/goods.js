const moment = require('moment');
const { paginationCnt } = require('../../config/elasticsearchConfig');
const { esClient } = require('./elasticsearch');

// goods_rating 조회 시 소수점 버림 필요

async function getGoodsByGoodsName(searchAfter, goodsName, order) {
  const body = {};

  let sort;
  if (order == 0) {
    sort = [{ goods_score: 'desc' }];
  } else if (order == 1) {
    sort = [{ goods_price: 'desc' }];
  } else if (order == 2) {
    sort = [{ goods_price: 'asc' }];
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
    index: 'yamyamgoods',
    type: 'goods',
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
    obj.goods_rating = Number(hits[i]._source.goods_rating.tofixed(1));
    obj.goods_price = hits[i]._source.goods_price;
    obj.goods_minimum_amount = hits[i]._source.goods_minimum_amount;
    obj.goods_detail = hits[i]._source.goods_detail;
    obj.goods_review_cnt = hits[i]._source.goods_review_cnt;
    obj.goods_img = hits[i]._source.goods_img;
    obj.store_name = hits[i]._source.store_name;

    result.goods.push(obj);
  }

  result.totalCnt = response.hits.total;

  return result;
}

async function addGoods(goodsIdx, goodsName, goodsDate, storeIdx, storeName, price, deliveryCharge, deliveryPeriod, minimumAmount, detailImg, imgArr) {
  const newGoodsDate = moment(goodsDate).format('YYYY-MM-DD HH:mm:ss');

  const body = {
    goods_idx: goodsIdx,
    goods_name: goodsName,
    goods_rating: 0,
    goods_price: price,
    goods_delivery_charge: deliveryCharge,
    goods_delivery_period: deliveryPeriod,
    goods_minimum_amount: minimumAmount,
    goods_detail: detailImg,
    goods_date: newGoodsDate,
    goods_review_cnt: 0,
    goods_img: imgArr,
    goods_score: 0,
    store_name: storeName,
  };

  await esClient.index({
    id: goodsIdx,
    index: 'yamyamgoods',
    type: 'goods',
    body,
  });
}

async function updateReviewCntAndGoodsRating(goodsIdx, goodsRating) {
  const body = {};
  body.query = {
    match: {
      goods_idx: goodsIdx,
    },
  };
  body.script = {
    inline: `ctx._source.goods_review_cnt++; ctx._source.goods_rating=${goodsRating}`,
  };

  await esClient.updateByQuery({
    index: 'yamyamgoods',
    type: 'goods',
    body,
  });
}

// ReviewCnt += 1
async function updateReviewCnt(goodsIdx) {
  const body = {};
  body.query = {
    match: {
      goods_idx: goodsIdx,
    },
  };
  body.script = {
    inline: 'ctx._source.goods_review_cnt++',
  };

  await esClient.updateByQuery({
    index: 'yamyamgoods',
    type: 'goods',
    body,
  });
}

async function updateGoodsRating(goodsIdx, goodsRating) {
  const body = {};
  body.query = {
    match: {
      goods_idx: goodsIdx,
    },
  };
  body.script = {
    inline: `ctx._source.goods_rating=${goodsRating}`,
  };

  await esClient.updateByQuery({
    index: 'yamyamgoods',
    type: 'goods',
    body,
  });
}

async function updateGoodsScore(goodsIdx, goodsScore) {
  const body = {};
  body.query = {
    match: {
      goods_idx: goodsIdx,
    },
  };
  body.script = {
    source: `ctx._source.goods_score=${goodsScore}`,
  };

  await esClient.updateByQuery({
    index: 'yamyamgoods',
    type: 'goods',
    body,
  });
}

module.exports = {
  getGoodsByGoodsName,
  addGoods,
  updateReviewCnt,
  updateGoodsRating,
  updateGoodsScore,
  updateReviewCntAndGoodsRating,
};
