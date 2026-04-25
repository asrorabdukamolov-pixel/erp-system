const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// @route   GET api/orders
// @desc    Get all orders
// @access  Private
router.get('/', auth, orderController.getOrders);

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, orderController.getOrderById);

// @route   POST api/orders
// @desc    Create an order
// @access  Private
router.post('/', auth, orderController.createOrder);

// @route   PUT api/orders/:id
// @desc    Update an order
// @access  Private
router.put('/:id', auth, orderController.updateOrder);

// @route   DELETE api/orders/:id
// @desc    Delete an order
// @access  Private
router.delete('/:id', auth, orderController.deleteOrder);

// @route   GET api/orders/trash/all
// @desc    Get all trashed orders
// @access  Private
router.get('/trash/all', auth, orderController.getTrashedOrders);

// @route   POST api/orders/:id/restore
// @desc    Restore an order
// @access  Private
router.post('/:id/restore', auth, orderController.restoreOrder);

// @route   POST api/orders/:id/log
// @desc    Add timeline log to order
// @access  Private
router.post('/:id/log', auth, orderController.addOrderLog);

module.exports = router;
