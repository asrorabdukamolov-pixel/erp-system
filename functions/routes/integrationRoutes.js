const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const aiController = require('../controllers/aiController');

// @route   POST api/integrations/amocrm
// @desc    Receive Lead from AmoCRM Webhook
// @access  Public
router.post('/amocrm', integrationController.receiveAmoLead);

// @route   POST api/integrations/calls
// @desc    Receive Call Log from Telephony Provider
// @access  Public
router.post('/calls', integrationController.receiveCallLog);

// @route   POST api/integrations/ai-chat
// @desc    Handle AI Assistant Chat
// @access  Public
router.post('/ai-chat', aiController.handleAIChat);

module.exports = router;
