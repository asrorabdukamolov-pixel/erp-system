const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getRequests = async (req, res) => {
    try {
        let queryRef = db.collection('money_requests');
        if (req.user.role === 'proekt_manager') {
            queryRef = queryRef.where('userId', '==', req.user.id);
        } else if (req.user.role === 'showroom') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }

        const snapshot = await queryRef.get();
        const requests = formatQuery(snapshot);
        requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(requests);
    } catch (err) {
        console.error("GetRequests Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createRequest = async (req, res) => {
    try {
        const newRequest = {
            ...req.body,
            userId: req.user.id,
            userName: req.user.name,
            showroom: req.user.showroom || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('money_requests').add(newRequest);
        res.json({ _id: docRef.id, ...newRequest });
    } catch (err) {
        console.error("CreateRequest Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const requestRef = db.collection('money_requests').doc(req.params.id);
        const doc = await requestRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'So\'rov topilmadi' });

        const updateData = { status };
        if (status === 'approved') {
            updateData.approvedBy = req.user.name;
            updateData.approvedAt = new Date().toISOString();
        } else if (status === 'paid') {
            updateData.paidAt = new Date().toISOString();
        }

        await requestRef.update(updateData);
        const updated = await requestRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("UpdateRequestStatus Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const requestRef = db.collection('money_requests').doc(req.params.id);
        const doc = await requestRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'So\'rov topilmadi' });
        
        await requestRef.delete();
        res.json({ msg: 'So\'rov o\'chirildi' });
    } catch (err) {
        console.error("DeleteRequest Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
