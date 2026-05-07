const express = require('express');
const router = express.Router();
const factoryController = require('../controllers/factoryController');
const auth = require('../middleware/auth');

router.get('/', auth, factoryController.getFactories);
router.post('/', auth, factoryController.createFactory);
router.put('/:id', auth, factoryController.updateFactory);
router.delete('/:id', auth, factoryController.deleteFactory);

module.exports = router;
