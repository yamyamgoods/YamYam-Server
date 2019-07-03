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
    const goodsId = goods[i].goods_idx;
    // 유저 즐겨찾기 flag 추가
    const user = await userDao.selectUserWithGoods(userId, goodsId);

    if (user.length === 0) {
      goods[i].scrap_flag = 0;
    } else {
      goods[i].scrap_flag = 1;
    }

    // 굿즈 이미지 추가
    const goodsImg = await goodsDao.selectGoodsImg(goodsId);
    // 굿즈 이미지 중 가장 첫 번째 이미지 사용
    goods[i].goods_img = goodsImg[0].goods_img;

    result.push(goods[i]);
  }

  return result;
}

module.exports = {
  getBestGoods,
};
