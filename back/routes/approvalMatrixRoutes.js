const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const approvalMatrixController = require('../controllers/approvalMatrixController');

router.get('/', auth, approvalMatrixController.getAll);
router.post('/', auth, approvalMatrixController.create);
router.put('/:id', auth, approvalMatrixController.update);
router.delete('/:id', auth, approvalMatrixController.delete);

module.exports = router;
