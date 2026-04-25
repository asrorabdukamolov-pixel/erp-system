const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const auth = require('../middleware/auth');

router.get('/', auth, partnerController.getPartners);
router.post('/', auth, partnerController.createPartner);

module.exports = router;
