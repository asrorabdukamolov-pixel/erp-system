const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');

// @route   POST api/upload
// @desc    Upload a file to Storage
// @access  Private
router.post('/', auth, uploadController.uploadFile);

module.exports = router;
