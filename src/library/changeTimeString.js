const moment = require('moment');

// 한국 시간대로 맞추기
require('moment-timezone');

moment.tz.setDefault('Asia/Seoul');


// 리뷰 작성 시간 스트링 생성
function makeReviewTimeString(writingTime) {
  const timeDiffArr = moment(writingTime).fromNow().split(' ');

  let result = '';

  if (timeDiffArr[0] == 'a') {
    result += '1';

    if (timeDiffArr[1] == 'year') {
      result += '년';
    } else if (timeDiffArr[1] == 'month') {
      result += '달';
    } else if (timeDiffArr[1] == 'day') {
      result += '일';
    } else if (timeDiffArr[1] == 'hour') {
      result += '시간';
    } else if (timeDiffArr[1] == 'minute') {
      result += '분';
    }

    result += '전';
  } else {
    result += timeDiffArr[0];

    if (timeDiffArr[1] == 'years') {
      result += '년';
    } else if (timeDiffArr[1] == 'months') {
      result += '달';
    } else if (timeDiffArr[1] == 'days') {
      result += '일';
    } else if (timeDiffArr[1] == 'hours') {
      result += '시간';
    } else if (timeDiffArr[1] == 'minutes') {
      result += '분';
    }

    result += '전';
  }

  return result;
}

module.exports = {
  makeReviewTimeString,
};
