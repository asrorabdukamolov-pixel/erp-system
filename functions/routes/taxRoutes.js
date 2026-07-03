const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');
const auth = require('../middleware/auth');

// Tax Types
router.get('/types', auth, taxController.getAllTypes);
router.post('/types', auth, taxController.createType);
router.put('/types/:id', auth, taxController.updateType);
router.delete('/types/:id', auth, taxController.deleteType);

// Tax Rates
router.get('/rates', auth, taxController.getAllRates);
router.post('/rates', auth, taxController.createRate);
router.put('/rates/:id', auth, taxController.updateRate);
router.delete('/rates/:id', auth, taxController.deleteRate);

// Seed
router.post('/seed', auth, taxController.seed);

module.exports = router;
