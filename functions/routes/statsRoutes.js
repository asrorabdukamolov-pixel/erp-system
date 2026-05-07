const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

router.get('/superadmin', auth, statsController.getSuperAdminStats);

module.exports = router;
