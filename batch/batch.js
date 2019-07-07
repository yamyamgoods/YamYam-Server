// 특정 시간으로 스케줄링할 경우 ec2의 시간을 확인!
// 태평양 시간으로 되있으므로 한국시간으로 바꿔주고 스케줄링 해야함.

const schedule = require('node-schedule');

const storeDao = require('../src/dao/storeDao');
const userDao = require('../src/dao/userDao');

async function calculateStoreRank() {
  await storeDao.updateAllStoreHit(0);
  await storeDao.updateAllStoreScrapCnt(0);
  await storeDao.updateAllStoreRank();
}

async function deleteAlarm() {
  await userDao.deleteAlarm();
}

// 매주 일요일 23:59에 크롤링
schedule.scheduleJob({ hour: 23, minute: 59, dayOfWeek: 0 }, () => {
  // 스토어 랭킹 스코어 계산
  calculateStoreRank();

  // 알람 데이터 삭제
  deleteAlarm();
});
