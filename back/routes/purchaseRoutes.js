const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const auth = require('../middleware/auth');

router.get('/', auth, purchaseController.getPurchases);
router.post('/', auth, purchaseController.createPurchase);
router.put('/:id', auth, purchaseController.updatePurchase);
router.delete('/:id', auth, purchaseController.deletePurchase);

module.exports = router;
