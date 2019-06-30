const userDao = require('../dao/userDao');

async function findUserPageInfo(userId) {
    const userData = await userDao.selectUser(userId);

    // 필요시 데이터 가공 처리 (비즈니스 로직)

    return userData;
}

module.exports = {
    findUserPageInfo,
};
