const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getPartners = async (req, res) => {
    try {
        let queryRef = db.collection('partners');
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom);
        }
        
        const snapshot = await queryRef.get();
        const partners = formatQuery(snapshot);
        partners.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        
        res.json(partners);
    } catch (err) {
        console.error("Get Partners Error:", err.message);
        res.status(500).json({ message: 'Serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.createPartner = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: 'Hamkor nomi bo\'lishi shart!' });
        }

        const newPartner = {
            ...req.body,
            showroom: req.user.role === 'super' ? 'Asosiy (Super Admin)' : req.user.showroom || '',
            addedBy: req.user.name,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('partners').add(newPartner);
        res.json({ _id: docRef.id, ...newPartner });
    } catch (err) {
        console.error("Create Partner Error:", err.message);
        res.status(500).json({ message: 'Hamkorni saqlashda serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.updatePartner = async (req, res) => {
    try {
        const partnerRef = db.collection('partners').doc(req.params.id);
        const doc = await partnerRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Hamkor topilmadi' });

        await partnerRef.update(req.body);
        const updated = await partnerRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("Update Partner Error:", err.message);
        res.status(500).json({ message: 'Hamkorni yangilashda serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.deletePartner = async (req, res) => {
    try {
        const partnerRef = db.collection('partners').doc(req.params.id);
        const doc = await partnerRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Hamkor topilmadi' });

        await partnerRef.delete();
        res.json({ message: 'Hamkor o\'chirildi' });
    } catch (err) {
        console.error("Delete Partner Error:", err.message);
        res.status(500).json({ message: 'Hamkorni o\'chirishda serverda xatolik yuz berdi: ' + err.message });
    }
};
