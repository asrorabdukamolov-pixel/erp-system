const express = require('express');
const router = express.Router();
const positionController = require('../controllers/positionController');
const auth = require('../middleware/auth');

router.get('/', auth, positionController.getPositions);
router.post('/', auth, positionController.createPosition);
router.put('/:id', auth, positionController.updatePosition);
router.delete('/:id', auth, positionController.deletePosition);

module.exports = router;
