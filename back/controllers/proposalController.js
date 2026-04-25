const Proposal = require('../models/Proposal');

// @desc    Get all active proposals
// @access  Private
exports.getProposals = async (req, res) => {
    try {
        let query = { status: { $ne: 'trash' } };
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }
        if (req.user.role === 'sotuv_manager') {
            query.managerId = req.user.id;
        }
        const proposals = await Proposal.find(query).sort({ createdAt: -1 });
        res.json(proposals);
    } catch (err) {
        console.error("Get Proposals Error:", err.message);
        res.status(500).json({ message: 'Takliflarni yuklashda xatolik yuz berdi: ' + err.message });
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
            showroom: req.user.showroom,
            status: 'active'
        });
        const proposal = await newProposal.save();
        res.json(proposal);
    } catch (err) {
        console.error("Create Proposal Error:", err.message);
        res.status(500).json({ message: 'Taklifni saqlashda serverda xatolik yuz berdi: ' + err.message });
    }
};

// @desc    Update proposal
// @access  Private
exports.updateProposal = async (req, res) => {
    try {
        let proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Taklif topilmadi' });

        proposal = await Proposal.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(proposal);
    } catch (err) {
        console.error("Update Proposal Error:", err.message);
        res.status(500).json({ message: 'Taklifni yangilashda serverda xatolik yuz berdi: ' + err.message });
    }
};

// @desc    Delete proposal (soft delete)
// @access  Private
exports.deleteProposal = async (req, res) => {
    try {
        const { reason } = req.body;
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Taklif topilmadi' });
        
        proposal.status = 'trash';
        proposal.deleteReason = reason || 'Sabab ko\'rsatilmadi';
        proposal.deletedBy = req.user.name;
        proposal.deletedAt = new Date();
        
        await proposal.save();
        res.json({ message: 'Taklif savatga tashlandi' });
    } catch (err) {
        console.error("Delete Proposal Error:", err.message);
        res.status(500).json({ message: 'Taklifni o\'chirishda serverda xatolik yuz berdi: ' + err.message });
    }
};

// @desc    Get trashed proposals
// @access  Private
exports.getTrashedProposals = async (req, res) => {
    try {
        const query = { status: 'trash' };
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }
        if (req.user.role === 'sotuv_manager') {
            query.managerId = req.user.id;
        }
        const proposals = await Proposal.find(query).sort({ deletedAt: -1 });
        res.json(proposals);
    } catch (err) {
        console.error("Get Trashed Proposals Error:", err.message);
        res.status(500).json({ message: 'O\'chirilgan takliflarni yuklashda xatolik: ' + err.message });
    }
};

// @desc    Restore proposal
// @access  Private
exports.restoreProposal = async (req, res) => {
    try {
        const proposal = await Proposal.findById(req.params.id);
        if (!proposal) return res.status(404).json({ message: 'Taklif topilmadi' });

        proposal.status = 'active';
        await proposal.save();
        res.json(proposal);
    } catch (err) {
        console.error("Restore Proposal Error:", err.message);
        res.status(500).json({ message: 'Taklifni tiklashda xatolik: ' + err.message });
    }
};
