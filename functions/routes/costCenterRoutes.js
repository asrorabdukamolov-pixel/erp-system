const express = require('express');
const router = express.Router();
const { getCostCenters, createCostCenter, updateCostCenter, deleteCostCenter } = require('../controllers/costCenterController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, getCostCenters);
router.post('/', auth, role(['super']), createCostCenter);
router.put('/:id', auth, role(['super']), updateCostCenter);
router.delete('/:id', auth, role(['super']), deleteCostCenter);

module.exports = router;
