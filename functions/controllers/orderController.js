const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getOrders = async (req, res) => {
    try {
        let queryRef = db.collection('orders');
        
        if (req.user.role !== 'super' && req.user.role !== 'fabrika') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }

        const snapshot = await queryRef.get();
        let orders = formatQuery(snapshot);
        
        // Filter out trashed orders in memory to avoid index requirements
        orders = orders.filter(o => o.status !== 'trash');
        
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
            managerPhone: req.user.phone || '',
            showroom: req.user.showroom || '',
            showroomPhone: req.user.showroomPhone || '',
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

        // Auto-clear factory status if PM re-submits to production
        if (req.body.pmStatus === 'topshirildi') {
            updateData.factoryStatus = null;
        }

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
        } else if (req.body.status === 'active' && order.proposalId) {
            await db.collection('proposals').doc(order.proposalId).update({ status: 'active' });
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
        
        if (order.proposalId) {
            await db.collection('proposals').doc(order.proposalId).update({ status: 'lost' });
        }

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

        if (order.proposalId) {
            await db.collection('proposals').doc(order.proposalId).update({ status: 'active' });
        }

        const updated = await orderRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("RestoreOrder Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.factoryAcceptOrder = async (req, res) => {
    try {
        const { deadline } = req.body;
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        const order = doc.data();

        const updateData = {
            factoryStatus: 'accepted',
            factoryDeadline: deadline,
            factoryAcceptedAt: new Date().toISOString(),
            pmStatus: 'ishlab_chiqarishda', // Move to processing stage
            timeline: [
                ...(order.timeline || []),
                {
                    type: 'system',
                    text: `Fabrika buyurtmani qabul qildi. Tayyor bo'lish muddati: ${deadline}`,
                    user: req.user.name,
                    time: new Date().toISOString()
                }
            ]
        };

        await orderRef.update(updateData);
        const updated = await orderRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("FactoryAcceptOrder Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.factoryRejectOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const orderRef = db.collection('orders').doc(req.params.id);
        const doc = await orderRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        const order = doc.data();

        const updateData = {
            factoryStatus: 'rejected',
            factoryRejectReason: reason,
            pmStatus: 'yangi_buyurtma', // Move back to PM review
            timeline: [
                ...(order.timeline || []),
                {
                    type: 'factory_rejection',
                    text: `Fabrika buyurtmani rad etdi. Sabab: ${reason}`,
                    user: req.user.name,
                    time: new Date().toISOString()
                }
            ]
        };

        await orderRef.update(updateData);
        const updated = await orderRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("FactoryRejectOrder Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
