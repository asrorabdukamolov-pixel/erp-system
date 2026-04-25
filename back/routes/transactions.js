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

// @route   DELETE api/transactions/:id
// @desc    Remove transaction (soft delete)
// @access  Private
router.delete('/:id', auth, transactionController.removeTransaction);

// @route   GET api/transactions/trash/all
// @desc    Get all trashed transactions
// @access  Private
router.get('/trash/all', auth, transactionController.getTrashedTransactions);

// @route   POST api/transactions/:id/restore
// @desc    Restore transaction
// @access  Private
router.post('/:id/restore', auth, transactionController.restoreTransaction);

module.exports = router;
