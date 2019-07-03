const userService = require('../service/userService');
const { response, errorResponse } = require('../library/response');

async function getUser(req, res) {
  try {
     console.log(req.query.user);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getUser,
};
