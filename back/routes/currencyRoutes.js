const express = require('express');
const router = express.Router();
const currencyController = require('../controllers/currencyController');
const auth = require('../middleware/auth');

router.get('/', auth, currencyController.getAll);
router.get('/:id', auth, currencyController.getById);
router.post('/', auth, currencyController.create);
router.put('/:id', auth, currencyController.update);
router.delete('/:id', auth, currencyController.delete);
router.post('/seed', auth, currencyController.seed);

module.exports = router;
