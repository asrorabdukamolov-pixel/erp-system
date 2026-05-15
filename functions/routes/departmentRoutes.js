const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, getDepartments);
router.post('/', auth, role(['super']), createDepartment);
router.put('/:id', auth, role(['super']), updateDepartment);
router.delete('/:id', auth, role(['super']), deleteDepartment);

module.exports = router;
