const redis = require('redis');

const redisClient = redis.createClient({
  retry_strategy(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      // return new Error('ECONNREFUSED'); //
      return 10000;
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return 10000;
  },
});

const util = require('util');

const { response, errorResponse } = require('../library/response');
const { getUserIdxFromJwt } = require('../library/jwtCheck');

// key : 요청 URL, value : 응답 데이터
async function addCacheResponseWithJwtCheck(authorization, key, value) {
  try {
    if (!redisClient.connected) return;

    const userIdx = getUserIdxFromJwt(authorization);

    if (!userIdx) {
      const set = util.promisify(redisClient.set).bind(redisClient);

      const minute = 5; // 5 : 5초, 60 * 5 : 5분
      await set(key, JSON.stringify(value), 'EX', minute); // 5분간 캐시
    }
  } catch (error) {
    console.log(error);
  }
}

// 데이터 비즈니스 로직 처리전 레디스의 데이터 유무 확인
async function getCacheResponseWithJwtCheck(req, res, next) {
  try {
    if (!redisClient.connected) next();

    const userIdx = getUserIdxFromJwt(req.headers.authorization);

    if (!userIdx) {
      const key = req.url;

      const get = util.promisify(redisClient.get).bind(redisClient);

      let result = await get(key);

      if (result) {
        result = JSON.parse(result);

        response('Success', result, res, 200);
        return;
      }
    }

    next();
  } catch (error) {
    console.log(error);
    next();
  }
}

async function addCacheResponse(authorization, key, value) {
  try {
    if (!redisClient.connected) return;

    const set = util.promisify(redisClient.set).bind(redisClient);

    const minute = 5; // 5 : 5초, 60 * 5 : 5분
    await set(key, JSON.stringify(value), 'EX', minute); // 5분간 캐시
  } catch (error) {
    console.log(error);
  }
}

async function getCacheResponse(req, res, next) {
  try {
    if (!redisClient.connected) next();

    const key = req.url;

    const get = util.promisify(redisClient.get).bind(redisClient);

    let result = await get(key);

    if (result) {
      result = JSON.parse(result);

      response('Success', result, res, 200);
      return;
    }
    next();
  } catch (error) {
    console.log(error);
    next();
  }
}

module.exports = {
  addCacheResponse,
  getCacheResponse,
  addCacheResponseWithJwtCheck,
  getCacheResponseWithJwtCheck,
};
