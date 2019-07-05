const moment = require('moment');

moment.locale('ko');

// 리뷰 작성 시간 스트링 생성
function makeReviewTimeString(writingTime) {
  const currentTime = moment();
  const momentWritingTime = moment(writingTime).format('YYYY.MM.DD HH:mm:ss');
  const timeDiff = moment.duration(currentTime.diff(momentWritingTime)).asHours();

  if (timeDiff > 24) {
    return momentWritingTime;
  }

  return moment(momentWritingTime).fromNow();
}

module.exports = {
  makeReviewTimeString,
};
