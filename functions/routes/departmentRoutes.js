const express = require('express');
const router = express.Router();
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.get('/', auth, getDepartments);
router.post('/', auth, role(['super']), createDepartment);

module.exports = router;
