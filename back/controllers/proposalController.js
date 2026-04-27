const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getProposals = async (req, res) => {
    try {
        let queryRef = db.collection('proposals').where('status', '!=', 'trash');
        
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }
        if (req.user.role === 'sotuv_manager' || req.user.role === 'proekt_manager') {
            queryRef = queryRef.where('managerId', '==', req.user.id);
        }

        const snapshot = await queryRef.get();
        const proposals = formatQuery(snapshot);
        proposals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(proposals);
    } catch (err) {
        console.error("Get Proposals Error:", err.message);
        res.status(500).json({ message: 'Takliflarni yuklashda xatolik yuz berdi: ' + err.message });
    }
};

exports.createProposal = async (req, res) => {
    try {
        const newProposal = {
            ...req.body,
            managerId: req.user.id,
            managerName: req.user.name,
            showroom: req.user.showroom || '',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('proposals').add(newProposal);
        res.json({ _id: docRef.id, ...newProposal });
    } catch (err) {
        console.error("Create Proposal Error:", err.message);
        res.status(500).json({ message: 'Taklifni saqlashda serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.updateProposal = async (req, res) => {
    try {
        const proposalRef = db.collection('proposals').doc(req.params.id);
        const doc = await proposalRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Taklif topilmadi' });

        await proposalRef.update(req.body);
        const updated = await proposalRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("Update Proposal Error:", err.message);
        res.status(500).json({ message: 'Taklifni yangilashda serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.deleteProposal = async (req, res) => {
    try {
        const { reason } = req.body;
        const proposalRef = db.collection('proposals').doc(req.params.id);
        const doc = await proposalRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Taklif topilmadi' });
        
        const updateData = {
            status: 'trash',
            deleteReason: reason || 'Sabab ko\'rsatilmadi',
            deletedBy: req.user.name,
            deletedAt: new Date().toISOString()
        };
        
        await proposalRef.update(updateData);
        res.json({ message: 'Taklif savatga tashlandi' });
    } catch (err) {
        console.error("Delete Proposal Error:", err.message);
        res.status(500).json({ message: 'Serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.getTrashedProposals = async (req, res) => {
    try {
        let queryRef = db.collection('proposals').where('status', '==', 'trash');
        
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }
        if (req.user.role === 'sotuv_manager' || req.user.role === 'proekt_manager') {
            queryRef = queryRef.where('managerId', '==', req.user.id);
        }

        const snapshot = await queryRef.get();
        const proposals = formatQuery(snapshot);
        proposals.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        res.json(proposals);
    } catch (err) {
        console.error("Get Trashed Proposals Error:", err.message);
        res.status(500).json({ message: 'O\'chirilgan takliflarni yuklashda xatolik: ' + err.message });
    }
};

exports.restoreProposal = async (req, res) => {
    try {
        const proposalRef = db.collection('proposals').doc(req.params.id);
        const doc = await proposalRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Taklif topilmadi' });

        await proposalRef.update({ status: 'active' });
        const updated = await proposalRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("Restore Proposal Error:", err.message);
        res.status(500).json({ message: 'Taklifni tiklashda xatolik: ' + err.message });
    }
};
