const { db, formatQuery, formatDoc } = require('../config/firebase');
const { sendMessage } = require('../utils/telegram');

// Helper to select best manager based on weight (60/40) and schedule
async function selectBestManager(showroom, excludeManagerId = null) {
    try {
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'sotuv_manager')
            .where('status', '==', 'active')
            .get();
        
        let managers = [];
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            managers.push({ id: doc.id, ...data });
        });

        // Exclude manager if requested (e.g. for reassignment)
        if (excludeManagerId) {
            managers = managers.filter(m => m.id !== excludeManagerId && m._id !== excludeManagerId);
        }

        if (managers.length === 0) {
            return null;
        }

        if (showroom) {
            const showroomManagers = managers.filter(m => m.showroom === showroom);
            if (showroomManagers.length > 0) {
                managers = showroomManagers;
            }
        }

        const now = new Date();
        const tashkentTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
        let currentDay = tashkentTime.getUTCDay();
        if (currentDay === 0) currentDay = 7;

        const workingToday = managers.filter(m => {
            const days = m.workDays || [1, 2, 3, 4, 5, 6, 7];
            return days.includes(currentDay);
        });

        let candidates = workingToday.length > 0 ? workingToday : managers;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

        const candidatesWithScores = await Promise.all(candidates.map(async (m) => {
            const mId = m.id || m._id;
            const ordersSnapshot = await db.collection('orders')
                .where('managerId', '==', mId)
                .where('createdAt', '>=', thirtyDaysAgoIso)
                .get();
            
            const count = ordersSnapshot.size;
            const weight = Number(m.leadWeight) || 50;
            const score = count / (weight || 1);
            return { manager: m, count, score };
        }));

        candidatesWithScores.sort((a, b) => a.score - b.score);
        return candidatesWithScores[0]?.manager || null;
    } catch (err) {
        console.error("selectBestManager Error:", err.message);
        return null;
    }
}

// @desc    Receive Lead from AmoCRM Webhook
// @access  Public
exports.receiveAmoLead = async (req, res) => {
    try {
        console.log("Received AmoCRM Webhook:", JSON.stringify(req.body));

        const leadData = req.body.leads?.add?.[0] || req.body.leads?.update?.[0];
        
        if (!leadData) {
            return res.status(200).json({ msg: "No lead data found" });
        }

        const leadId = leadData.id;
        const leadName = leadData.name;
        const price = leadData.price;
        
        let phone = '';
        let source = 'AmoCRM';
        let notes = `AmoCRM Lead ID: ${leadId}\nName: ${leadName}`;
        let meetingFormat = ''; // showroom or measurement
        let meetingTime = ''; // ISO string

        // Extract custom fields
        if (leadData.custom_fields) {
            leadData.custom_fields.forEach(field => {
                const nameLower = (field.name || '').toLowerCase();
                const codeLower = (field.code || '').toLowerCase();
                const value = field.values?.[0]?.value;

                if (nameLower.includes('phone') || codeLower.includes('phone') || nameLower.includes('tel') || nameLower.includes('telefon')) {
                    phone = value;
                }
                if (nameLower.includes('source') || codeLower.includes('source') || nameLower.includes('manba')) {
                    source = value;
                }
                if (nameLower.includes('izoh') || nameLower.includes('notes') || nameLower.includes('comment') || nameLower.includes('yozish')) {
                    notes += `\n${field.name}: ${value}`;
                }
                if (nameLower.includes('uchrashuv formati') || nameLower.includes('meeting format') || nameLower.includes('format')) {
                    const valLower = (value || '').toLowerCase();
                    if (valLower.includes('showroom') || valLower.includes('shourum') || valLower.includes('keladi')) {
                        meetingFormat = 'showroom';
                    } else if (valLower.includes('olch') || valLower.includes('o\'lch') || valLower.includes('borish') || valLower.includes('measure')) {
                        meetingFormat = 'measure';
                    }
                }
                if (nameLower.includes('vaqt') || nameLower.includes('time') || nameLower.includes('sana') || nameLower.includes('date')) {
                    if (value) {
                        try {
                            const num = Number(value);
                            if (!isNaN(num) && num > 0) {
                                meetingTime = new Date(num * 1000).toISOString();
                            } else {
                                meetingTime = new Date(value).toISOString();
                            }
                        } catch (e) {
                            console.error("Failed to parse time:", value);
                        }
                    }
                }
            });
        }

        // Prevent duplicate leads
        const existingOrderSnapshot = await db.collection('orders')
            .where('amoId', '==', leadId)
            .limit(1)
            .get();
        
        if (!existingOrderSnapshot.empty) {
            console.log(`Lead ${leadId} already exists in Express ERP. Skipping.`);
            return res.status(200).json({ success: true, msg: "Lead already exists" });
        }

        // Create Customer
        let customerId = '';
        let firstName = leadName || 'AmoCRM';
        let lastName = 'Lead';
        if (leadName) {
            const parts = leadName.split(' ');
            firstName = parts[0];
            if (parts.length > 1) {
                lastName = parts.slice(1).join(' ');
            }
        }

        if (phone) {
            const customerSnapshot = await db.collection('customers')
                .where('phone', '==', phone)
                .limit(1)
                .get();
            
            if (!customerSnapshot.empty) {
                customerId = customerSnapshot.docs[0].id;
                const custData = customerSnapshot.docs[0].data();
                firstName = custData.firstName || firstName;
                lastName = custData.lastName || lastName;
            } else {
                const newCustomer = {
                    firstName,
                    lastName,
                    phone: phone,
                    source: source,
                    createdAt: new Date().toISOString()
                };
                const custRef = await db.collection('customers').add(newCustomer);
                customerId = custRef.id;
            }
        }

        // Select the best manager based on shift and workload (60/40)
        const manager = await selectBestManager();
        const managerId = manager ? (manager.id || manager._id) : null;
        const managerName = manager ? `${manager.name} ${manager.surname}`.trim() : 'System';

        const timelineEntries = [
            {
                type: 'system',
                text: `AmoCRM Call Center-dan yangi lid qabul qilindi. Mas'ul menejer: ${managerName}`,
                user: 'AmoCRM System',
                time: new Date().toISOString()
            }
        ];

        if (notes) {
            timelineEntries.push({
                type: 'comment',
                text: `${notes}`,
                user: 'AmoCRM Agent',
                time: new Date().toISOString()
            });
        }

        // Get total orders for EXP-XXX seq id
        const allOrdersSnap = await db.collection('orders').get();
        const orderCount = allOrdersSnap.size;

        const newOrder = {
            uniqueId: `EXP-${orderCount + 1001}`,
            status: 'amocrm_lead', 
            pmStatus: 'yangi_kp_ariza',
            totalAmount: price || 0,
            amount: price || 0,
            currency: 'UZS',
            selectedCustomer: {
                firstName,
                lastName,
                phone: phone || '',
                address: '',
                source: source || 'AmoCRM'
            },
            customerId: customerId,
            managerId: managerId,
            managerName: managerName,
            amoId: leadId,
            notes: notes,
            meetingFormat: meetingFormat || '',
            meetingTime: meetingTime || '',
            createdAt: new Date().toISOString(),
            orderDate: new Date().toISOString().split('T')[0],
            timeline: timelineEntries
        };

        const orderRef = await db.collection('orders').add(newOrder);

        // Trigger immediate task check
        checkAmoLeadsAndTasksInternal().catch(e => console.error("Immediate task check failed:", e.message));

        res.status(200).json({ 
            success: true, 
            msg: "Lead created and distributed successfully", 
            orderId: orderRef.id,
            managerName
        });

    } catch (err) {
        console.error("ReceiveAmoLead Error:", err.message);
        res.status(200).json({ error: err.message });
    }
};

// @desc    Receive Call Logs from Telephony Provider
// @access  Public
exports.receiveCallLog = async (req, res) => {
    try {
        console.log("Received Call Log Webhook:", JSON.stringify(req.body));

        const customerPhone = req.body.customer_phone || req.body.phone;
        const recordingUrl = req.body.recording_url || req.body.link;
        const duration = req.body.duration || 0;

        if (!customerPhone || !recordingUrl) {
            return res.status(200).json({ msg: "Incomplete call data" });
        }

        const orderSnapshot = await db.collection('orders')
            .where('customerPhone', '==', customerPhone)
            .orderBy('createdAt', 'desc')
            .limit(1)
            .get();

        if (orderSnapshot.empty) {
            console.log(`No order found for customer ${customerPhone}.`);
            return res.status(200).json({ msg: "No matching order found" });
        }

        const orderId = orderSnapshot.docs[0].id;
        const orderData = orderSnapshot.docs[0].data();

        let aiInsight = "AI tahlili jarayonda...";
        const callLog = {
            type: 'call',
            text: `Telefon suhbati yozib olindi (${duration} soniya). [Zapisni eshitish](${recordingUrl})`,
            aiAnalysis: aiInsight,
            user: orderData.managerName || 'Manager',
            time: new Date().toISOString(),
            recordingUrl: recordingUrl
        };

        await db.collection('orders').doc(orderId).update({
            timeline: [...(orderData.timeline || []), callLog]
        });

        res.status(200).json({ success: true, msg: "Call log attached to order" });

    } catch (err) {
        console.error("ReceiveCallLog Error:", err.message);
        res.status(200).json({ error: err.message });
    }
};

// @desc    Manually check tasks and reassign if necessary (Cron endpoint)
// @access  Public
exports.checkAmoLeadsAndTasks = async (req, res) => {
    try {
        await checkAmoLeadsAndTasksInternal();
        res.json({ success: true, msg: "Checked successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Internal task checker function
async function checkAmoLeadsAndTasksInternal() {
    try {
        const now = new Date();

        // 1. Auto-close leads in 'mijoz_kotarmadi' stage if older than 168 hours
        try {
            console.log("Checking for stale leads in 'mijoz_kotarmadi' stage...");
            const staleOrdersSnapshot = await db.collection('orders')
                .where('status', '==', 'mijoz_kotarmadi')
                .get();

            if (!staleOrdersSnapshot.empty) {
                const staleOrders = [];
                staleOrdersSnapshot.forEach(doc => {
                    staleOrders.push({ id: doc.id, ...doc.data() });
                });

                for (const order of staleOrders) {
                    const updatedTimeStr = order.statusUpdatedAt || order.createdAt;
                    if (!updatedTimeStr) continue;

                    const updatedTime = new Date(updatedTimeStr);
                    const ageMs = now - updatedTime;

                    // 168 hours = 168 * 60 * 60 * 1000
                    if (ageMs >= 168 * 60 * 60 * 1000) {
                        console.log(`Auto-closing order ${order.id} (stale in 'mijoz_kotarmadi' for > 168 hours)...`);

                        const updateData = {
                            status: 'trash',
                            deleteReason: 'Hozir emas',
                            deletedBy: 'System',
                            deletedAt: now.toISOString(),
                            timeline: [
                                ...(order.timeline || []),
                                {
                                    type: 'system',
                                    text: `Buyurtma avtomatik o'chirildi (Savatga tashlandi). Sabab: Hozir emas (Mijoz ko'tarmadi bosqichida 168 soatdan ortiq qolib ketdi)`,
                                    user: 'System',
                                    time: now.toISOString()
                                }
                            ]
                        };

                        await db.collection('orders').doc(order.id).update(updateData);

                        if (order.proposalId) {
                            await db.collection('proposals').doc(order.proposalId).update({ status: 'lost' });
                        }

                        // Complete active tasks
                        const orderTasksSnapshot = await db.collection('tasks')
                            .where('orderId', '==', order.id)
                            .get();
                        
                        if (!orderTasksSnapshot.empty) {
                            const batch = db.batch();
                            orderTasksSnapshot.forEach(taskDoc => {
                                const task = taskDoc.data();
                                if (task.status !== 'bajarildi') {
                                    batch.update(db.collection('tasks').doc(taskDoc.id), {
                                        status: 'bajarildi',
                                        completedAt: now.toISOString()
                                    });
                                }
                            });
                            await batch.commit();
                        }
                    }
                }
            }
        } catch (staleErr) {
            console.error("Stale leads check error:", staleErr.message);
        }

        // 1.2 Auto-close or warn leads in 'uchrashuv' (Ma'lumot berildi) stage based on age
        try {
            console.log("Checking for stale leads in 'uchrashuv' (Ma'lumot berildi) stage...");
            const staleUchrashuvSnapshot = await db.collection('orders')
                .where('status', '==', 'uchrashuv')
                .get();

            if (!staleUchrashuvSnapshot.empty) {
                const staleUchrashuvOrders = [];
                staleUchrashuvSnapshot.forEach(doc => {
                    staleUchrashuvOrders.push({ id: doc.id, ...doc.data() });
                });

                for (const order of staleUchrashuvOrders) {
                    const updatedTimeStr = order.statusUpdatedAt || order.createdAt;
                    if (!updatedTimeStr) continue;

                    const updatedTime = new Date(updatedTimeStr);
                    const ageMs = now - updatedTime;

                    // Condition 1: > 720 hours -> auto-close
                    if (ageMs >= 720 * 60 * 60 * 1000) {
                        console.log(`Auto-closing order ${order.id} (stale in 'uchrashuv' for > 720 hours)...`);

                        const updateData = {
                            status: 'trash',
                            deleteReason: 'Hozir emas',
                            deletedBy: 'System',
                            deletedAt: now.toISOString(),
                            timeline: [
                                ...(order.timeline || []),
                                {
                                    type: 'system',
                                    text: `Buyurtma avtomatik o'chirildi (Savatga tashlandi). Sabab: Hozir emas (Ma'lumot berildi bosqichida 720 soatdan ortiq qolib ketdi)`,
                                    user: 'System',
                                    time: now.toISOString()
                                }
                            ]
                        };

                        await db.collection('orders').doc(order.id).update(updateData);

                        if (order.proposalId) {
                            await db.collection('proposals').doc(order.proposalId).update({ status: 'lost' });
                        }

                        // Complete active tasks
                        const orderTasksSnapshot = await db.collection('tasks')
                            .where('orderId', '==', order.id)
                            .get();
                        
                        if (!orderTasksSnapshot.empty) {
                            const batch = db.batch();
                            orderTasksSnapshot.forEach(taskDoc => {
                                const task = taskDoc.data();
                                if (task.status !== 'bajarildi') {
                                    batch.update(db.collection('tasks').doc(taskDoc.id), {
                                        status: 'bajarildi',
                                        completedAt: now.toISOString()
                                    });
                                }
                            });
                            await batch.commit();
                        }
                    }
                    // Condition 2: > 480 hours -> send warning once
                    else if (ageMs >= 480 * 60 * 60 * 1000 && !order.warning480Sent) {
                        console.log(`Sending 480h warning for order ${order.id}...`);

                        if (order.managerId) {
                            try {
                                const userDoc = await db.collection('users').doc(order.managerId).get();
                                if (userDoc.exists && userDoc.data().telegramChatId) {
                                    const tgMessage = `🚨 *Ogohlantirish!*\n\n` +
                                        `"10 kundan so'ng mijozni boy berasiz" aloqaga chiqing.\n\n` +
                                        `👤 *Mijoz:* ${order.selectedCustomer?.firstName} ${order.selectedCustomer?.lastName || ''} (${order.selectedCustomer?.phone})\n` +
                                        `🆔 *Buyurtma ID:* ${order.uniqueId || order.id}`;
                                    await sendMessage(userDoc.data().telegramChatId, tgMessage);
                                }
                            } catch (tgErr) {
                                console.error("Telegram warning send error:", tgErr.message);
                            }
                        }

                        await db.collection('orders').doc(order.id).update({
                            warning480Sent: true,
                            timeline: [
                                ...(order.timeline || []),
                                {
                                    type: 'system',
                                    text: `Tizim ogohlantirishi yuborildi: "10 kundan so'ng mijozni boy berasiz" aloqaga chiqing.`,
                                    user: 'System',
                                    time: now.toISOString()
                                }
                            ]
                        });
                    }
                }
            }
        } catch (uchrashuvErr) {
            console.error("Uchrashuv stale check error:", uchrashuvErr.message);
        }

        // 1.3 Notify managers 2 hours before tasks due date in 'kp_yuborildi' (Zamer olish) stage
        try {
            console.log("Checking for upcoming tasks in 'kp_yuborildi' (Zamer olish) stage...");
            const kpOrdersSnapshot = await db.collection('orders')
                .where('status', '==', 'kp_yuborildi')
                .get();

            if (!kpOrdersSnapshot.empty) {
                const kpOrders = [];
                kpOrdersSnapshot.forEach(doc => {
                    kpOrders.push({ id: doc.id, ...doc.data() });
                });

                for (const order of kpOrders) {
                    const tasksSnapshot = await db.collection('tasks')
                        .where('orderId', '==', order.id)
                        .get();

                    if (!tasksSnapshot.empty) {
                        for (const taskDoc of tasksSnapshot.docs) {
                            const task = { id: taskDoc.id, ...taskDoc.data() };
                            if (task.status === 'bajarildi' || task.notified2h || !task.dueDate) continue;

                            const dueDate = new Date(task.dueDate);
                            const timeDiffMs = dueDate - now;

                            // 2 hours window: between 0 and 2.1 hours
                            if (timeDiffMs <= 2.1 * 60 * 60 * 1000 && timeDiffMs > 0) {
                                console.log(`Sending 2h task notification for task ${task.id} (order ${order.id})...`);

                                const assigneeId = task.assigneeId || order.managerId;
                                if (assigneeId) {
                                    try {
                                        const userDoc = await db.collection('users').doc(assigneeId).get();
                                        if (userDoc.exists && userDoc.data().telegramChatId) {
                                            const tgMessage = `🔔 *Vazifa eslatmasi!*\n\n` +
                                                `"Mijoz sizni kutmoqda, zamer olish uchun boring" deb\n\n` +
                                                `👤 *Mijoz:* ${order.selectedCustomer?.firstName} ${order.selectedCustomer?.lastName || ''} (${order.selectedCustomer?.phone})\n` +
                                                `📝 *Vazifa:* ${task.title}\n` +
                                                `📅 *Vaqti:* ${new Date(task.dueDate).toLocaleString('uz-UZ')}`;
                                            await sendMessage(userDoc.data().telegramChatId, tgMessage);
                                        }
                                    } catch (tgErr) {
                                        console.error("Telegram task notification error:", tgErr.message);
                                    }
                                }

                                await db.collection('tasks').doc(task.id).update({
                                    notified2h: true
                                });
                            }
                        }
                    }
                }
            }
        } catch (kpErr) {
            console.error("KP (Zamer olish) tasks check error:", kpErr.message);
        }

        // 2. Call Center (Amo) leads check
        console.log("Running task checks for Call Center (Amo) leads...");
        const ordersSnapshot = await db.collection('orders')
            .where('status', '==', 'yangi')
            .get();

        if (ordersSnapshot.empty) {
            console.log("No leads in Call Center (Amo) stage.");
            return;
        }

        const orders = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });

        for (const order of orders) {
            const { meetingFormat, meetingTime, managerId, managerName } = order;
            if (!meetingFormat || !meetingTime) continue;

            const meetingTimeDate = new Date(meetingTime);
            const timeDiffMs = meetingTimeDate - now;

            // Only run checks if meetingTime is within a valid window (between -24 hours and +2.1 hours)
            const isWithinWindow = timeDiffMs <= 2.1 * 60 * 60 * 1000 && timeDiffMs > -24 * 60 * 60 * 1000;
            if (!isWithinWindow) continue;

            const tasksSnapshot = await db.collection('tasks')
                .where('orderId', '==', order.id)
                .get();
            
            const tasksList = [];
            tasksSnapshot.forEach(doc => {
                tasksList.push({ id: doc.id, ...doc.data() });
            });

            const activeTasks = tasksList.filter(t => t.status !== 'bajarildi');

            if (meetingFormat === 'showroom') {
                if (activeTasks.length === 0) {
                    // Create Task 1
                    const title = `Mijozga aloqaga chiqing, shoowromga tashrif buyurmoqchi`;
                    const customerInfo = order.selectedCustomer 
                        ? `[Mijoz: ${order.selectedCustomer.firstName} ${order.selectedCustomer.lastName || ''} | Tel: ${order.selectedCustomer.phone}]`
                        : "";
                    const fullTitle = `${customerInfo} ${title}`.trim();

                    const newTask = {
                        title: fullTitle,
                        description: `Mijoz showroomga kelish vaqti: ${new Date(meetingTime).toLocaleString('uz-UZ')}`,
                        assigneeId: managerId,
                        assigneeName: managerName,
                        creatorId: 'system',
                        creatorName: 'AmoCRM System',
                        orderId: order.id,
                        orderUniqueId: order.uniqueId || '',
                        dueDate: meetingTime,
                        status: 'yangi',
                        priority: 'orta',
                        showroom: order.showroom || 'General',
                        createdAt: now.toISOString(),
                        comments: []
                    };
                    await db.collection('tasks').add(newTask);
                    console.log(`Created Task 1 for manager ${managerName} on order ${order.id}`);

                    // Send Telegram notification
                    try {
                        const userDoc = await db.collection('users').doc(managerId).get();
                        if (userDoc.exists && userDoc.data().telegramChatId) {
                            const tgMessage = `📌 *Yangi vazifa!*\n\n` +
                                `👤 *Mijoz:* ${order.selectedCustomer?.firstName} ${order.selectedCustomer?.lastName || ''} (${order.selectedCustomer?.phone})\n` +
                                `📝 *Sarlavha:* Mijozga aloqaga chiqing, shoowromga tashrif buyurmoqchi\n` +
                                `📅 *Uchrashuv vaqti:* ${new Date(meetingTime).toLocaleString('uz-UZ')}\n\nIltimos, aloqaga chiqing.`;
                            await sendMessage(userDoc.data().telegramChatId, tgMessage);
                        }
                    } catch (err) {
                        console.error("Telegram notification error:", err.message);
                    }

                } else {
                    activeTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    const latestTask = activeTasks[0];

                    const taskCreatedAt = new Date(latestTask.createdAt);
                    const taskAgeMs = now - taskCreatedAt;

                    // If task is unresolved and older than 2 hours
                    if (taskAgeMs >= 2 * 60 * 60 * 1000) {
                        console.log(`Task ${latestTask.id} has been unresolved for > 2 hours. Reassigning manager...`);

                        // Close the previous task
                        await db.collection('tasks').doc(latestTask.id).update({
                            status: 'bajarildi',
                            completedAt: now.toISOString()
                        });

                        // Select a different manager
                        const newManager = await selectBestManager(order.showroom, managerId);
                        if (newManager) {
                            const oldManagerName = managerName;
                            const newManagerId = newManager.id || newManager._id;
                            const newManagerName = `${newManager.name} ${newManager.surname}`.trim();

                            // Update Order
                            await db.collection('orders').doc(order.id).update({
                                managerId: newManagerId,
                                managerName: newManagerName,
                                timeline: [
                                    ...(order.timeline || []),
                                    {
                                        type: 'system',
                                        text: `Menejer o'zgardi (Lid 2 soat davomida javobsiz qoldi): ${oldManagerName} -> ${newManagerName}`,
                                        user: 'System',
                                        time: now.toISOString()
                                    }
                                ]
                            });

                            // Create Task 2 for the new manager
                            const title2 = `Tezda aloqaga chiqing, mijoz sizni kutyapti`;
                            const customerInfo = order.selectedCustomer 
                                ? `[Mijoz: ${order.selectedCustomer.firstName} ${order.selectedCustomer.lastName || ''} | Tel: ${order.selectedCustomer.phone}]`
                                : "";
                            const fullTitle2 = `${customerInfo} ${title2}`.trim();

                            const newDueDate = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();

                            const newTask2 = {
                                title: fullTitle2,
                                description: `Avvalgi menejer javob bermagani sababli lid sizga o'tkazildi. Tezkor aloqaga chiqing.`,
                                assigneeId: newManagerId,
                                assigneeName: newManagerName,
                                creatorId: 'system',
                                creatorName: 'AmoCRM System',
                                orderId: order.id,
                                orderUniqueId: order.uniqueId || '',
                                dueDate: newDueDate,
                                status: 'yangi',
                                priority: 'orta',
                                showroom: order.showroom || 'General',
                                createdAt: now.toISOString(),
                                comments: []
                            };
                            await db.collection('tasks').add(newTask2);

                            // Notify new manager via Telegram
                            try {
                                if (newManager.telegramChatId) {
                                    const tgMessage = `🚨 *Tezkor Vazifa!*\n\n` +
                                        `👤 *Mijoz:* ${order.selectedCustomer?.firstName} ${order.selectedCustomer?.lastName || ''} (${order.selectedCustomer?.phone})\n` +
                                        `📝 *Sarlavha:* Tezda aloqaga chiqing, mijoz sizni kutyapti\n` +
                                        `⚠️ *Eslatma:* Avvalgi menejer 2 soat davomida javob bermagani sababli, lid sizga biriktirildi.`;
                                    await sendMessage(newManager.telegramChatId, tgMessage);
                                }
                            } catch (err) {
                                console.error("Telegram notification error:", err.message);
                            }
                        }
                    }
                }
            } else if (meetingFormat === 'measure') {
                if (activeTasks.length === 0) {
                    // Create Task for measurement remind
                    const title = `Mijozga aloqaga chiqing, o'lcham olish vaqtini eslating`;
                    const customerInfo = order.selectedCustomer 
                        ? `[Mijoz: ${order.selectedCustomer.firstName} ${order.selectedCustomer.lastName || ''} | Tel: ${order.selectedCustomer.phone}]`
                        : "";
                    const fullTitle = `${customerInfo} ${title}`.trim();

                    const newTask = {
                        title: fullTitle,
                        description: `Mijoz bilan o'lcham olish vaqti: ${new Date(meetingTime).toLocaleString('uz-UZ')}`,
                        assigneeId: managerId,
                        assigneeName: managerName,
                        creatorId: 'system',
                        creatorName: 'AmoCRM System',
                        orderId: order.id,
                        orderUniqueId: order.uniqueId || '',
                        dueDate: meetingTime,
                        status: 'yangi',
                        priority: 'orta',
                        showroom: order.showroom || 'General',
                        createdAt: now.toISOString(),
                        comments: []
                    };
                    await db.collection('tasks').add(newTask);
                    console.log(`Created Measurement Reminder Task for manager ${managerName} on order ${order.id}`);

                    // Send Telegram notification
                    try {
                        const userDoc = await db.collection('users').doc(managerId).get();
                        if (userDoc.exists && userDoc.data().telegramChatId) {
                            const tgMessage = `📌 *Yangi vazifa!*\n\n` +
                                `👤 *Mijoz:* ${order.selectedCustomer?.firstName} ${order.selectedCustomer?.lastName || ''} (${order.selectedCustomer?.phone})\n` +
                                `📝 *Sarlavha:* Mijozga aloqaga chiqing, o'lcham olish vaqtini eslating\n` +
                                `📅 *O'lcham olish vaqti:* ${new Date(meetingTime).toLocaleString('uz-UZ')}\n\nIltimos, eslatib o'ting.`;
                            await sendMessage(userDoc.data().telegramChatId, tgMessage);
                        }
                    } catch (err) {
                        console.error("Telegram notification error:", err.message);
                    }
                }
            }
        }
    } catch (err) {
        console.error("checkAmoLeadsAndTasksInternal Error:", err.message);
    }
}

module.exports.checkAmoLeadsAndTasksInternal = checkAmoLeadsAndTasksInternal;

exports.selectBestPM = async function selectBestPM(showroom) {
    try {
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'proekt_manager')
            .where('status', '==', 'active')
            .get();
        
        let pms = [];
        usersSnapshot.forEach(doc => {
            const data = doc.data();
            pms.push({ id: doc.id, ...data });
        });

        if (pms.length === 0) {
            return null;
        }

        if (showroom) {
            const showroomPMs = pms.filter(p => p.showroom === showroom);
            if (showroomPMs.length > 0) {
                pms = showroomPMs;
            }
        }

        const now = new Date();
        const tashkentTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
        let currentDay = tashkentTime.getUTCDay();
        if (currentDay === 0) currentDay = 7;

        const workingToday = pms.filter(p => {
            const days = p.workDays || [1, 2, 3, 4, 5, 6, 7];
            return days.includes(currentDay);
        });

        let candidates = workingToday.length > 0 ? workingToday : pms;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

        const candidatesWithScores = await Promise.all(candidates.map(async (p) => {
            const pId = p.id || p._id;
            const ordersSnapshot = await db.collection('orders')
                .where('assignedPmId', '==', pId)
                .where('createdAt', '>=', thirtyDaysAgoIso)
                .get();
            
            const count = ordersSnapshot.size;
            const weight = Number(p.leadWeight) || 50;
            const score = count / (weight || 1);
            return { pm: p, count, score };
        }));

        candidatesWithScores.sort((a, b) => a.score - b.score);
        return candidatesWithScores[0]?.pm || null;
    } catch (err) {
        console.error("selectBestPM Error:", err.message);
        return null;
    }
};
