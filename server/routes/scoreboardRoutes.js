const express = require('express');
const router = express.Router();
const scoreboardController = require('../controllers/scoreboardController');

router.get('/', scoreboardController.getScoreboard);

module.exports = router;
