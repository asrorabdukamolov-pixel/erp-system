const express = require('express');
const router = express.Router();
const migrationController = require('../controllers/migrationController');
const auth = require('../middleware/auth');

// @route   POST api/migrate
// @desc    Migrate localStorage data to DB
// @access  Private (Admin only)
router.post('/', auth, migrationController.migrateData);

// @route   DELETE api/migrate/reset
// @desc    Barcha bazani tozalash (0 holatga qaytarish)
// @access  Private (Admin only)
router.delete('/reset', auth, migrationController.resetDatabase);

module.exports = router;
