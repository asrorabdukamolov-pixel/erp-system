const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getOrders = async (req, res) => {
    try {
        let queryRef = db.collection('orders').where('status', '!=', 'trash');
        
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }

        const snapshot = await queryRef.get();
        const orders = formatQuery(snapshot);
        orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        res.json(orders);
    } catch (err) {
        console.error("GetOrders Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const doc = await db.collection('orders').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        res.json(formatDoc(doc));
    } catch (err) {
        console.error("GetOrderById Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createOrder = async (req, res) => {
    try {
        const newOrder = {
            ...req.body,
            managerId: req.user.id,
            managerName: req.user.name,
            showroom: req.user.showroom || '',
            createdAt: new Date().toISOString(),
            timeline: [{
                type: 'system',
                text: 'Buyurtma yaratildi',
                user: req.user.name,
                time: new Date().toISOString()
            }]
        };

        const docRef = await db.collection('orders').add(newOrder);
        res.json({ _id: docRef.id, ...newOrder });
    } catch (err) {
        console.error("CreateOrder Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        const order = doc.data();

        const updateData = { ...req.body };

        if (req.body.status && req.body.status !== order.status) {
            updateData.timeline = [
                ...(order.timeline || []),
                {
                    type: 'status',
                    text: `Status o'zgardi: ${order.status} -> ${req.body.status}`,
                    user: req.user.name,
                    time: new Date().toISOString()
                }
            ];
        }

        if (req.body.status === 'tasdiqlandi' && order.proposalId) {
            await db.collection('proposals').doc(order.proposalId).update({ status: 'sold' });
        }

        await orderRef.update(updateData);
        const updated = await orderRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("UpdateOrder Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        const order = doc.data();

        const updateData = {
            status: 'trash',
            deleteReason: reason || '',
            deletedBy: req.user.name,
            deletedAt: new Date().toISOString(),
            timeline: [
                ...(order.timeline || []),
                {
                    type: 'system',
                    text: `Buyurtma o'chirildi (Savatga tashlandi). Sabab: ${reason}`,
                    user: req.user.name,
                    time: new Date().toISOString()
                }
            ]
        };

        await orderRef.update(updateData);
        res.json({ msg: 'Buyurtma o\'chirildi' });
    } catch (err) {
        console.error("DeleteOrder Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.addOrderLog = async (req, res) => {
    try {
        const { text, type = 'comment' } = req.body;
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        const order = doc.data();

        const newLog = {
            type,
            text,
            user: req.user.name,
            time: new Date().toISOString()
        };

        await orderRef.update({
            timeline: [...(order.timeline || []), newLog]
        });

        const updated = await orderRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("AddOrderLog Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.getTrashedOrders = async (req, res) => {
    try {
        let queryRef = db.collection('orders').where('status', '==', 'trash');
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }
        
        const snapshot = await queryRef.get();
        const orders = formatQuery(snapshot);
        orders.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
        res.json(orders);
    } catch (err) {
        console.error("GetTrashedOrders Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.restoreOrder = async (req, res) => {
    try {
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        const order = doc.data();

        const updateData = {
            status: 'pm',
            timeline: [
                ...(order.timeline || []),
                {
                    type: 'system',
                    text: `Buyurtma tiklandi.`,
                    user: req.user.name,
                    time: new Date().toISOString()
                }
            ]
        };

        await orderRef.update(updateData);
        const updated = await orderRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("RestoreOrder Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
