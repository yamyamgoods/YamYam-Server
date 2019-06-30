const userService = require('../service/userService');
const { response, errorResponse } = require('../library/response');

async function getUserPageInfo(req, res) {
  try {
    const userId = req.params.userId;

    const responseData = await userService.findUserPageInfo(userId);

    response('Success', responseData, res, 200);
  } catch (error) {
    errorResponse(error.message, res, error.statusCode);
  }
}

module.exports = {
  getUserPageInfo,
};
