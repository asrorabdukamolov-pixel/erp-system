const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const aiController = require('../controllers/aiController');

router.post('/amocrm', integrationController.receiveAmoLead);
router.post('/calls', integrationController.receiveCallLog);
router.get('/cron-check', integrationController.checkAmoLeadsAndTasks);
router.post('/ai-chat', aiController.handleAIChat);

module.exports = router;
