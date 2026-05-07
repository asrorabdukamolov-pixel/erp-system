const express = require('express');
const router = express.Router();
const proposalController = require('../controllers/proposalController');
const auth = require('../middleware/auth');

router.get('/', auth, proposalController.getProposals);
router.get('/trash', auth, proposalController.getTrashedProposals);
router.post('/', auth, proposalController.createProposal);
router.put('/:id', auth, proposalController.updateProposal);
router.delete('/:id', auth, proposalController.deleteProposal);
router.post('/:id/restore', auth, proposalController.restoreProposal);

module.exports = router;
