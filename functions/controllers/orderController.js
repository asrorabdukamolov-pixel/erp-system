const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getOrders = async (req, res) => {
    try {
        let queryRef = db.collection('orders');
        
        if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }

        const snapshot = await queryRef.get();
        let orders = formatQuery(snapshot);
        
        // Filter out trashed orders in memory to avoid the composite index requirement
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

        // Auto-assign best PM if moving to yangi_kp_ariza and no PM is assigned
        if (req.body.pmStatus === 'yangi_kp_ariza' && req.body.status === 'pm' && !order.assignedPmId && !req.body.assignedPmId) {
            try {
                const { selectBestPM } = require('./integrationController');
                const bestPm = await selectBestPM(order.showroom || req.body.showroom);
                if (bestPm) {
                    updateData.assignedPmId = bestPm.id || bestPm._id;
                    updateData.assignedPmName = bestPm.name;
                    updateData.assignedPmPhone = bestPm.phone || '';
                    updateData.assignedAt = new Date().toISOString();
                    
                    updateData.timeline = [
                        ...(updateData.timeline || order.timeline || []),
                        {
                            type: 'system',
                            text: `Avtomatik taqsimlash: Loyiha menejeri biriktirildi - ${bestPm.name}`,
                            user: 'Tizim',
                            time: new Date().toISOString()
                        }
                    ];
                }
            } catch (assignErr) {
                console.error("Auto-assign PM error:", assignErr.message);
            }
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

            if (order.status === 'amocrm_lead' && req.body.status !== 'amocrm_lead') {
                try {
                    const tasksSnapshot = await db.collection('tasks')
                        .where('orderId', '==', req.params.id)
                        .get();
                    
                    const batch = db.batch();
                    tasksSnapshot.forEach(doc => {
                        const taskData = doc.data();
                        if (taskData.status !== 'bajarildi') {
                            batch.update(doc.ref, {
                                status: 'bajarildi',
                                completedAt: new Date().toISOString()
                            });
                        }
                    });
                    await batch.commit();
                    console.log(`Closed active tasks for order ${req.params.id} as it moved out of amocrm_lead`);
                } catch (taskErr) {
                    console.error("Error auto-closing tasks on status change:", taskErr.message);
                }
            }
            if (req.body.status === 'oylayabdi' && order.status !== 'oylayabdi') {
                try {
                    const taskDueDate = new Date();
                    taskDueDate.setHours(taskDueDate.getHours() + 24); // Give 24 hours to schedule

                    const newTask = {
                        orderId: req.params.id,
                        title: "Proekt menedjer KP ni tayyorlab yubordi, mijoz bilan kelishib uchrashuv vaqtini belgilang",
                        status: 'yangi',
                        dueDate: taskDueDate.toISOString(),
                        createdAt: new Date().toISOString(),
                        type: 'call',
                        assigneeId: order.managerId,
                        assigneeName: order.managerName || ''
                    };
                    
                    const taskRef = await db.collection('tasks').add(newTask);
                    console.log(`Created KP tayyor task ${taskRef.id} for order ${req.params.id}`);

                    updateData.timeline = [
                        ...(updateData.timeline || []),
                        {
                            type: 'task',
                            text: "Yangi vazifa yaratildi: Proekt menedjer KP ni tayyorlab yubordi...",
                            user: 'Tizim',
                            time: new Date().toISOString()
                        }
                    ];
                } catch (taskErr) {
                    console.error("Error auto-creating task for KP tayyor:", taskErr.message);
                }
            }
        }

        if (req.body.status === 'tasdiqlandi' && order.proposalId) {
            await db.collection('proposals').doc(order.proposalId).update({ status: 'sold' });
        } else if (req.body.status === 'active' && order.proposalId) {
            // If moved back to active deal stages
            await db.collection('proposals').doc(order.proposalId).update({ status: 'active' });
        }

        await orderRef.update(updateData);
        const updated = await orderRef.get();

        // Trigger immediate check of tasks for the lead
        try {
            const { checkAmoLeadsAndTasksInternal } = require('./integrationController');
            checkAmoLeadsAndTasksInternal().catch(e => console.error("Post-update task check failed:", e.message));
        } catch (requireErr) {
            console.error("Failed to require integrationController:", requireErr.message);
        }

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
        
        // Also mark linked proposal as lost
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

        // Also restore linked proposal status to active
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

exports.checkUpdates = async (req, res) => {
    try {
        const { lastCreatedAt, lastStatusUpdatedAt } = req.query;
        
        const [snapCreated, snapStatus] = await Promise.all([
            db.collection('orders').orderBy('createdAt', 'desc').limit(1).get(),
            db.collection('orders').orderBy('statusUpdatedAt', 'desc').limit(1).get()
        ]);
        
        const latestCreatedTime = snapCreated.empty ? '' : (snapCreated.docs[0].data().createdAt || '');
        const latestStatusTime = snapStatus.empty ? '' : (snapStatus.docs[0].data().statusUpdatedAt || '');
        
        const hasCreatedNew = latestCreatedTime && latestCreatedTime !== lastCreatedAt;
        const hasStatusNew = latestStatusTime && latestStatusTime !== lastStatusUpdatedAt;
        
        res.json({
            hasUpdates: hasCreatedNew || hasStatusNew,
            latestCreatedAt: latestCreatedTime,
            latestStatusUpdatedAt: latestStatusTime
        });
    } catch (err) {
        console.error("CheckUpdates Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
