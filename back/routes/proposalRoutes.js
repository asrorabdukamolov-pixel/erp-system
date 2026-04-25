const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const auth = require('../middleware/auth');

router.get('/', auth, proposalController.getProposals);
router.post('/', auth, proposalController.createProposal);
router.delete('/:id', auth, proposalController.deleteProposal);

module.exports = router;
