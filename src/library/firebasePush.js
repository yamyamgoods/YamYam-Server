const FCM = require('fcm-node');

const { fcmKey, restrictedPackageName } = require('../../config/fcmConfig');

function getPushData(devicetoken, message) {
  // 발송할 Push 메시지 내용
  const pushData = {
    // 수신대상
    to: devicetoken,
    // App이 실행중이지 않을 때 상태바 알림으로 등록할 내용
    // notification: {
    //     title: "APP 이름",
    //     body: body, // content
    //     sound: "default",
    //     click_action: "FCM_PLUGIN_ACTIVITY",
    //     icon: "fcm_push_icon"
    // },
    // 메시지 중요도
    priority: 'high',
    // App 패키지 이름
    restricted_package_name: restrictedPackageName,
    // App에게 전달할 데이터
    data: {
      title: message,
    },
  };

  return pushData;
}

async function pushAlarm(devicetoken, message) {
  const fcm = new FCM(fcmKey);

  const pushData = getPushData(devicetoken, message);

  try {
    fcm.send(pushData);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  pushAlarm,
};
