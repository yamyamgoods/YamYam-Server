const goodsDao = require('../dao/goodsDao');
const userDao = require('../dao/userDao');

async function getBestGoods(userId, lastIndex) {
  const result = [];
  let goods;

  if (lastIndex == -1) {
    goods = await goodsDao.selectFirstBestGoods();
  } else {
    goods = await goodsDao.selectNextBestGoods(lastIndex);
  }

  const goodsLength = goods.length;
  for (let i = 0; i < goodsLength; i++) {
    const user = await userDao.selectUserWithGoods(userId, goods[i].goods_idx);

    if (user.length === 0) {
      goods[i].scrap_flag = 0;
    } else {
      goods[i].scrap_flag = 1;
    }

    result.push(goods[i]);
  }

  return result;
}

module.exports = {
  getBestGoods,
};
