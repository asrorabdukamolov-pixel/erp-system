const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegramController');

router.post('/webhook', telegramController.handleWebhook);
router.get('/setup', telegramController.setupWebhook);

module.exports = router;
