const { db, formatQuery, formatDoc } = require('../config/firebase');
const { sendMessage } = require('../utils/telegram');

// @desc    Get all tasks
// @route   GET api/tasks
exports.getTasks = async (req, res) => {
    try {
        let tasksRef = db.collection('tasks');
        
        // Filter based on role
        if (req.user.role === 'sotuv_manager' || req.user.role === 'proekt_manager') {
            const snapshot = await tasksRef.where('assigneeId', '==', req.user.id).get();
            const tasks = formatQuery(snapshot);
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            return res.json(tasks);
        } else if (req.user.role === 'showroom') {
            const snapshot = await tasksRef.where('showroom', '==', req.user.showroom).get();
            const tasks = formatQuery(snapshot);
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            return res.json(tasks);
        } else if (req.user.role === 'super') {
            const snapshot = await tasksRef.get();
            const tasks = formatQuery(snapshot);
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            return res.json(tasks);
        }

        res.json([]);
    } catch (err) {
        console.error("GetTasks Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Create a task
// @route   POST api/tasks
exports.createTask = async (req, res) => {
    try {
        const { title, description, assigneeId, assigneeName, orderId, orderUniqueId, dueDate, priority, showroom } = req.body;

        if (!assigneeId) {
            return res.status(400).json({ msg: 'Xodim biriktirilishi shart' });
        }

        if (!req.user || !req.user.id) {
            return res.status(401).json({ msg: 'Foydalanuvchi aniqlanmadi, qayta kiring' });
        }

        let updatedTitle = title;
        let customerInfo = "";

        // Fetch order details if linked to an order
        if (orderId) {
            try {
                const orderDoc = await db.collection('orders').doc(orderId).get();
                if (orderDoc.exists) {
                    const orderData = orderDoc.data();
                    const cust = orderData.selectedCustomer;
                    if (cust) {
                        customerInfo = `[Mijoz: ${cust.firstName} ${cust.lastName} | Tel: ${cust.phone}]`;
                        updatedTitle = `${customerInfo} ${title}`;
                    }
                }
            } catch (err) {
                console.error("Error fetching order for task:", err.message);
            }
        }

        const newTask = {
            title: updatedTitle,
            description: description || '',
            assigneeId,
            assigneeName,
            creatorId: req.user.id,
            creatorName: req.user.name,
            orderId: orderId || null,
            orderUniqueId: orderUniqueId || '',
            dueDate,
            status: req.body.status || (assigneeId === req.user.id ? 'jarayonda' : 'yangi'),
            priority: priority || 'orta',
            showroom: showroom || req.user.showroom || 'General',
            createdAt: new Date().toISOString(),
            comments: []
        };

        const docRef = await db.collection('tasks').add(newTask);
        
        // Notify via Telegram if assignee has a chatId
        try {
            const userDoc = await db.collection('users').doc(assigneeId).get();
            if (userDoc.exists && userDoc.data().telegramChatId) {
                const userData = userDoc.data();
                const deadline = new Date(dueDate).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                
                let message = `📌 *Yangi vazifa!*\n\n`;
                if (customerInfo) {
                    message += `👤 *Mijoz:* ${customerInfo.replace('[', '').replace(']', '')}\n`;
                }
                message += `📝 *Sarlavha:* ${title}\n`;
                if (orderUniqueId) {
                    message += `🔢 *Buyurtma:* ${orderUniqueId}\n`;
                }
                message += `📅 *Muddat:* ${deadline}\n`;
                message += `👤 *Kimdan:* ${req.user.name}\n\nIltimos, ERP tizimiga kirib batafsil tanishib chiqing.`;

                await sendMessage(userData.telegramChatId, message);
            }
        } catch (tgErr) {
            console.error("Telegram notification error:", tgErr.message);
        }

        res.json({ _id: docRef.id, id: docRef.id, ...newTask });
    } catch (err) {
        console.error("Backend Task Create Error:", err);
        res.status(500).json({ msg: 'Vazifa yaratishda xatolik: ' + err.message });
    }
};

// @desc    Update a task status or details
// @route   PUT api/tasks/:id
exports.updateTask = async (req, res) => {
    try {
        const taskRef = db.collection('tasks').doc(req.params.id);
        const doc = await taskRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Vazifa topilmadi' });

        const updateData = {};
        const { status, description, priority, dueDate } = req.body;
        
        if (status) {
            updateData.status = status;
            if (status === 'bajarildi') updateData.completedAt = new Date().toISOString();
        }
        if (description) updateData.description = description;
        if (priority) updateData.priority = priority;
        if (dueDate) updateData.dueDate = dueDate;

        await taskRef.update(updateData);
        const updated = await taskRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("UpdateTask Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Add comment to task
// @route   POST api/tasks/:id/comment
exports.addComment = async (req, res) => {
    try {
        const taskRef = db.collection('tasks').doc(req.params.id);
        const doc = await taskRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Vazifa topilmadi' });

        const task = doc.data();
        const newComment = {
            user: req.user.name,
            text: req.body.text,
            time: new Date().toISOString()
        };

        const updatedComments = [...(task.comments || []), newComment];
        await taskRef.update({ comments: updatedComments });
        
        const updated = await taskRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("AddComment Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Delete a task
// @route   DELETE api/tasks/:id
exports.deleteTask = async (req, res) => {
    try {
        const taskRef = db.collection('tasks').doc(req.params.id);
        const doc = await taskRef.get();
        if (!doc.exists) return res.status(404).json({ msg: 'Vazifa topilmadi' });

        await taskRef.delete();
        res.json({ msg: 'Vazifa o\'chirildi' });
    } catch (err) {
        console.error("DeleteTask Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

