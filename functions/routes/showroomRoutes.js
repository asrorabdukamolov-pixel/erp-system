const express = require('express');
const router = express.Router();
const showroomController = require('../controllers/showroomController');
const auth = require('../middleware/auth');

router.get('/', auth, showroomController.getShowrooms);
router.post('/', auth, showroomController.createShowroom);
router.put('/:id', auth, showroomController.updateShowroom);
router.delete('/:id', auth, showroomController.deleteShowroom);

module.exports = router;
