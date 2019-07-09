const jwt = require('jsonwebtoken');

const { errorResponse } = require('../library/response');
const { jwtKey, jwtOptions, refreshOptions } = require('../../config/jwtConfig');
const errorResponseObject = require('../../config/errorResponseObject');

const userDao = require('../dao/userDao');

function getUserIdxFromJwt(authorization) {
  if (!authorization) return undefined;

  const result = jwt.verify(authorization, jwtKey).userIdx;

  return result;
}

function jwtCheck(req, res, next) {
  const { authorization } = req.headers;

  try {
    req.user = jwt.verify(authorization, jwtKey);

    next();
  } catch (error) {
    errorResponse(error.message, res, 401);
  }
}

function sign(userIdx) {
  const payload = {
    userIdx,
  };

  const token = jwt.sign(payload, jwtKey, jwtOptions);

  return token;
}

function makeTestJwt(userIdx) {
  const payload = {
    userIdx,
  };

  const token = jwt.sign(payload, jwtKey, refreshOptions);
  console.log(token);
  return token;
}

function verify(authorization) {
  const decoded = jwt.verify(authorization, jwtKey);

  if (!decoded) {
    return -1;
  }
  return decoded;
}

// refresh
function getRefreshToken(userIdx) {
  const payload = {
    userIdx,
  };

  const token = jwt.sign(payload, jwtKey, refreshOptions);

  return token;
}

async function adminCheck(req, res, next) {
  const { authorization } = req.headers;

  try {
    req.user = jwt.verify(authorization, jwtKey);

    const userArr = await userDao.selectUser(req.user.userIdx);

    if (userArr[0].admin == 0) {
      throw errorResponseObject.authenticationError;
    }

    next();
  } catch (error) {
    errorResponse(error.message, res, 401);
  }
}

module.exports = {
  jwtCheck,
  sign,
  verify,
  getUserIdxFromJwt,
  getRefreshToken,
  adminCheck,
};
