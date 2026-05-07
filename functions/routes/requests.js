const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const auth = require('../middleware/auth');

router.get('/', auth, requestController.getRequests);
router.post('/', auth, requestController.createRequest);
router.put('/:id', auth, requestController.updateRequestStatus);
router.delete('/:id', auth, requestController.deleteRequest);

module.exports = router;
