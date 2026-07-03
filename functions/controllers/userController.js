const { db, formatQuery, formatDoc } = require('../config/firebase');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
    try {
        const { role, showroom } = req.query;
        let queryRef = db.collection('users');

        if (req.user.role !== 'super') {
            if (!req.user.showroom) return res.json([]);
            queryRef = queryRef.where('showroom', '==', req.user.showroom);
        } else {
            if (role) queryRef = queryRef.where('role', '==', role);
            if (showroom) queryRef = queryRef.where('showroom', '==', showroom);
        }

        const snapshot = await queryRef.get();
        let users = formatQuery(snapshot);

        if (req.user.role !== 'super') {
            users = users.filter(u => u._id !== req.user.id && u.role !== 'super');
        }

        // Fetch user activity for the current Tashkent date (UTC+5)
        const now = new Date();
        const tashkentTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
        const dateStr = tashkentTime.toISOString().split('T')[0];

        const activitySnapshot = await db.collection('user_activity').where('date', '==', dateStr).get();
        const activityMap = {};
        activitySnapshot.forEach(doc => {
            const data = doc.data();
            activityMap[data.userId] = data.activeSeconds || 0;
        });

        const threeMinutesAgo = new Date(now.getTime() - 3 * 60 * 1000);

        users = users.map(u => {
            delete u.password;
            const userId = u._id || u.id;
            const activeSeconds = activityMap[userId] || 0;
            
            // If lastActive is within 3 minutes, they are online
            const isOnline = u.lastActive ? new Date(u.lastActive) > threeMinutesAgo : false;
            
            return {
                ...u,
                isOnline,
                activeHoursToday: (activeSeconds / 3600).toFixed(1),
                hasAccount: u.hasAccount !== false
            };
        });

        users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        res.json(users);
    } catch (err) {
        console.error("GetUsers Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, surname, patronymic, login, password, role, showroom, phone, positionId, positionName, department, costCenterId, costCenterName, workRate, salary, hasAccount, workDays, leadWeight } = req.body;

        const usersRef = db.collection('users');
        
        let finalLogin = '';
        if (login) {
            finalLogin = login.toLowerCase();
            const snapshot = await usersRef.where('login', '==', finalLogin).get();
            if (!snapshot.empty) {
                return res.status(400).json({ msg: 'Bu login allaqachon band' });
            }
        } else {
            // Generate a unique dummy login for HR employees without login
            finalLogin = 'emp_' + Math.random().toString(36).substring(2, 11);
        }

        let hashedPassword = '';
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        const newUser = {
            name,
            surname,
            patronymic: patronymic || '',
            login: finalLogin,
            password: hashedPassword,
            role: role || 'sales_manager',
            phone: phone || '',
            showroom: showroom || req.user.showroom || '',
            positionId: positionId || '',
            positionName: positionName || '',
            department: department || '',
            costCenterId: costCenterId || '',
            costCenterName: costCenterName || '',
            workRate: workRate !== undefined ? Number(workRate) : 1.0,
            salary: salary !== undefined ? Number(salary) : 0,
            status: 'active',
            hasAccount: isAccount,
            workDays: req.body.workDays || [1, 2, 3, 4, 5, 6, 7],
            leadWeight: req.body.leadWeight !== undefined ? Number(req.body.leadWeight) : 50,
            createdAt: new Date().toISOString()
        };

        const docRef = await usersRef.add(newUser);
        res.json({ _id: docRef.id, ...newUser });
    } catch (err) {
        console.error("CreateUser Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { name, surname, patronymic, login, password, role, status, phone, showroom, positionId, positionName, department, costCenterId, costCenterName, workRate, salary, hasAccount, workDays, leadWeight } = req.body;
        const userRef = db.collection('users').doc(req.params.id);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });

        const updateData = {};
        if (name) updateData.name = name;
        if (surname) updateData.surname = surname;
        if (patronymic !== undefined) updateData.patronymic = patronymic;
        if (login) {
            const lowerLogin = login.toLowerCase();
            const snapshot = await db.collection('users').where('login', '==', lowerLogin).get();
            const exists = snapshot.docs.some(d => d.id !== req.params.id);
            if (exists) {
                return res.status(400).json({ msg: 'Bu login allaqachon band' });
            }
            updateData.login = lowerLogin;
        }
        if (role) updateData.role = role;
        if (status) updateData.status = status;
        if (phone !== undefined) updateData.phone = phone;
        if (showroom !== undefined) updateData.showroom = showroom;
        if (positionId !== undefined) updateData.positionId = positionId;
        if (positionName !== undefined) updateData.positionName = positionName;
        if (department !== undefined) updateData.department = department;
        if (costCenterId !== undefined) updateData.costCenterId = costCenterId;
        if (costCenterName !== undefined) updateData.costCenterName = costCenterName;
        if (workRate !== undefined) updateData.workRate = Number(workRate);
        if (salary !== undefined) updateData.salary = Number(salary);
        if (hasAccount !== undefined) updateData.hasAccount = hasAccount;
        if (workDays !== undefined) updateData.workDays = workDays;
        if (leadWeight !== undefined) updateData.leadWeight = Number(leadWeight);

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        console.log("BACK updateUser req.params.id:", req.params.id);
        console.log("BACK updateUser req.body:", req.body);
        console.log("BACK updateUser updateData:", updateData);

        await userRef.update(updateData);
        const updatedDoc = await userRef.get();
        console.log("BACK updateUser updated doc in Firestore:", updatedDoc.data());
        res.json(formatDoc(updatedDoc));
    } catch (err) {
        console.error("UpdateUser Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.heartbeat = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const currentIsoString = now.toISOString();

        // Calculate Uzbekistan local date (UTC+5)
        const tashkentTime = new Date(now.getTime() + (5 * 60 * 60 * 1000));
        const dateStr = tashkentTime.toISOString().split('T')[0];

        const docId = `${userId}_${dateStr}`;
        const activityRef = db.collection('user_activity').doc(docId);
        const doc = await activityRef.get();

        if (!doc.exists) {
            const newActivity = {
                userId,
                date: dateStr,
                activeSeconds: 60,
                lastActive: currentIsoString,
                createdAt: currentIsoString
            };
            await activityRef.set(newActivity);
        } else {
            const data = doc.data();
            const lastActiveTime = new Date(data.lastActive || data.createdAt);
            const diffMs = now - lastActiveTime;
            const diffSec = Math.floor(diffMs / 1000);

            let activeSeconds = data.activeSeconds || 0;
            // If the user's last heartbeat was within the last 5 minutes (300s), accumulate active time
            if (diffSec > 0 && diffSec < 300) {
                activeSeconds += diffSec;
            } else {
                activeSeconds += 60; // New burst/session starts
            }

            await activityRef.update({
                activeSeconds,
                lastActive: currentIsoString
            });
        }

        // Update user's lastActive timestamp
        await db.collection('users').doc(userId).update({
            lastActive: currentIsoString
        });

        res.json({ success: true });
    } catch (err) {
        console.error("Heartbeat Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const userRef = db.collection('users').doc(req.params.id);
        const doc = await userRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Foydalanuvchi topilmadi' });
        
        if (doc.data().role === 'super') {
            return res.status(403).json({ msg: 'Super adminni o\'chirish mumkin emas' });
        }

        await userRef.delete();
        res.json({ msg: 'Foydalanuvchi o\'chirildi' });
    } catch (err) {
        console.error("DeleteUser Error:", err.message);
        res.status(500).send('Server xatosi');
    }
};
