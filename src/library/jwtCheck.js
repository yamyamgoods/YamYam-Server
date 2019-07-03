const jwt = require('jsonwebtoken');

const { errorResponse } = require('../library/response');
const { jwtKey, jwtOptions, refreshOptions } = require('../../config/jwtConfig');
const errorResponseObject = require('../../config/errorResponseObject');

async function jwtCheck(req, res, next) {
  const { authorization } = req.headers;

  try {
    req.user = await jwt.verify(authorization);

    next();
  } catch (error) {
    errorResponse(error.message, res, 401);
  }
}

async function sign(userId) {
  const payload = {
    userId,
  };

  const token = jwt.sign(payload, jwtKey, jwtOptions);

  return token;
}

async function verify(jwtToken) {
  const decoded = jwt.verify(jwtToken, jwtKey);

  if (!decoded) {
    return -1;
  }
  return decoded;
}

// refresh

module.exports = {
  jwtCheck,
  sign,
  verify,
};
