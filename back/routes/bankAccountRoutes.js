const express = require('express');
const router = express.Router();
const bankAccountController = require('../controllers/bankAccountController');
const auth = require('../middleware/auth');

router.get('/', auth, bankAccountController.getAll);
router.get('/:id', auth, bankAccountController.getById);
router.post('/', auth, bankAccountController.create);
router.put('/:id', auth, bankAccountController.update);
router.delete('/:id', auth, bankAccountController.delete);
router.post('/seed', auth, bankAccountController.seed);

module.exports = router;
