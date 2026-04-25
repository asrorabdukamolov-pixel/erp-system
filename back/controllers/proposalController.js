const Proposal = require('../models/Proposal');

// @desc    Get all proposals
// @access  Private
exports.getProposals = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }
        const proposals = await Proposal.find(query).sort({ createdAt: -1 });
        res.json(proposals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Create new proposal
// @access  Private
exports.createProposal = async (req, res) => {
    try {
        const newProposal = new Proposal({
            ...req.body,
            managerId: req.user.id,
            managerName: req.user.name,
            showroom: req.user.showroom
        });
        const proposal = await newProposal.save();
        res.json(proposal);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Delete proposal
// @access  Private
exports.deleteProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ msg: 'Taklif topilmadi' });
        await proposal.remove();
        res.json({ msg: 'Taklif o\'chirildi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
