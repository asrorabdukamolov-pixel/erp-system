const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// @route   GET api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', auth, transactionController.getTransactions);

// @route   POST api/transactions
// @desc    Create a transaction
// @access  Private
router.post('/', auth, transactionController.createTransaction);

// @route   GET api/transactions/stats
// @desc    Get dashboard stats
// @access  Private
router.get('/stats', auth, transactionController.getDashboardStats);

module.exports = router;
