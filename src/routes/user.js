const express = require('express');

const router = express.Router();

// userController
const userController = require('../controller/userController');

router.get('/:userId', userController.getUser);

module.exports = router;
