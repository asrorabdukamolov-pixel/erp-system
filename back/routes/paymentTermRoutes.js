const express = require('express');
const router = express.Router();
const paymentTermController = require('../controllers/paymentTermController');
const auth = require('../middleware/auth');

router.get('/', auth, paymentTermController.getAll);
router.get('/:id', auth, paymentTermController.getById);
router.post('/', auth, paymentTermController.create);
router.put('/:id', auth, paymentTermController.update);
router.delete('/:id', auth, paymentTermController.delete);
router.post('/seed', auth, paymentTermController.seed);

module.exports = router;
