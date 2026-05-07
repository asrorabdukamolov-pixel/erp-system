const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');
const auth = require('../middleware/auth');

router.get('/', auth, partnerController.getPartners);
router.post('/', auth, partnerController.createPartner);
router.put('/:id', auth, partnerController.updatePartner);
router.delete('/:id', auth, partnerController.deletePartner);

module.exports = router;
