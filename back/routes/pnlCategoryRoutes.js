const express = require('express');
const router = express.Router();
const pnlCategoryController = require('../controllers/pnlCategoryController');
const auth = require('../middleware/auth');

router.get('/', auth, pnlCategoryController.getAll);
router.post('/', auth, pnlCategoryController.create);
router.put('/:id', auth, pnlCategoryController.update);
router.delete('/:id', auth, pnlCategoryController.delete);
router.post('/seed', auth, pnlCategoryController.seed);

module.exports = router;
