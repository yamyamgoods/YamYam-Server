// 특정 시간으로 스케줄링할 경우 ec2의 시간을 확인!
// 태평양 시간으로 되있으므로 한국시간으로 바꿔주고 스케줄링 해야함.

const schedule = require('node-schedule');

const userDao = require('../src/dao/userDao');

const goodsTransaction = require('../src/dao/goodsTransaction');
const storeTransaction = require('../src/dao/storeTransaction');

async function calculateStoreRank() {
  await storeTransaction.calculateStoreRankTransaction();
}

async function calculateGoodsRank() {
  await goodsTransaction.calculateGoodsRankTransaction();
}

async function deleteAlarm() {
  await userDao.deleteAlarm();
}

매주 일요일 23:59에 크롤링
schedule.scheduleJob({ hour: 23, minute: 59, dayOfWeek: 0 }, () => {
  // 스토어 랭킹 스코어 계산
  calculateStoreRank();

  // 알람 데이터 삭제
  deleteAlarm();

  // 굿즈 랭킹 스토어 계산
  calculateGoodsRank();
});
