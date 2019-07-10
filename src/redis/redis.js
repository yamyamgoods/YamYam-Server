const redis = require('redis');

const redisClient = redis.createClient();
const util = require('util');

const { response, errorResponse } = require('../library/response');

// key : 요청 URL, value : 응답 데이터
async function addCacheResponse(key, value) {
  const set = util.promisify(redisClient.set).bind(redisClient);

  await set(key, value);
}

// 데이터 비즈니스 로직 처리전 레디스의 데이터 유무 확인
async function getCacheResponse(req, res, next) {
  //console.log(req);
    const key ='';

  const get = util.promisify(redisClient.get).bind(redisClient);

  const result = await get(key);

  if (!result) {
    next();
  } else {
    response('Success', result, res, 200);
  }
}

module.exports = {
  addCacheResponse,
  getCacheResponse,
};
