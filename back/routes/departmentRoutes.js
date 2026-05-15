const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const auth = require('../middleware/auth');

router.get('/', auth, departmentController.getDepartments);
router.post('/', auth, departmentController.createDepartment);
router.put('/:id', auth, departmentController.updateDepartment);
router.delete('/:id', auth, departmentController.deleteDepartment);

module.exports = router;
