const User = require('../models/User');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Showroom = require('../models/Showroom');
const Customer = require('../models/Customer');

exports.migrateData = async (req, res) => {
    const results = {};
    try {
        const { users = [], orders = [], transactions = [], showrooms = [], customers = [] } = req.body;

        // 1. Foydalanuvchilarni migratsiya qilish
        let usersAdded = 0;
        for (const u of users) {
            try {
                const exists = await User.findOne({ login: u.login });
                if (!exists) {
                    const newUser = new User({
                        ...u,
                        _id: undefined,
                        name: u.name || u.login || 'Noma\'lum',
                        surname: u.surname || '-',
                        status: (u.status || 'active').toLowerCase(),
                        role: (u.role || 'showroom').toLowerCase()
                    });
                    await newUser.save();
                    usersAdded++;
                }
            } catch (e) {
                console.error('Foydalanuvchi xatosi:', u.login, e.message);
            }
        }
        results.users = usersAdded;

        // 2. Showroomlarni migratsiya qilish
        let showroomsAdded = 0;
        for (const s of showrooms) {
            try {
                const exists = await Showroom.findOne({ login: s.login });
                if (!exists) {
                    const newS = new Showroom({ ...s, _id: undefined });
                    await newS.save();
                    
                    // Create associated User so they can login
                    const userExists = await User.findOne({ login: s.login.toLowerCase() });
                    if (!userExists) {
                        const newUser = new User({
                            name: s.adminName || s.name,
                            surname: s.adminSurname || '-',
                            login: s.login.toLowerCase(),
                            password: s.password || '123',
                            role: 'showroom',
                            showroom: s.name
                        });
                        await newUser.save();
                    }
                    showroomsAdded++;
                }
            } catch (e) {
                console.error('Showroom xatosi:', s.login, e.message);
            }
        }
        results.showrooms = showroomsAdded;

        // 3. Mijozlarni migratsiya qilish
        let customersAdded = 0;
        for (const c of customers) {
            try {
                const exists = await Customer.findOne({ phone: c.phone });
                if (!exists) {
                    const newC = new Customer({ ...c, _id: undefined });
                    await newC.save();
                    customersAdded++;
                }
            } catch (e) {
                console.error('Mijoz xatosi:', c.phone, e.message);
            }
        }
        results.customers = customersAdded;

        // 4. Buyurtmalarni migratsiya qilish
        let ordersAdded = 0;
        for (const o of orders) {
            try {
                const exists = o.uniqueId ? await Order.findOne({ uniqueId: o.uniqueId }) : null;
                if (!exists) {
                    const newO = new Order({
                        ...o,
                        _id: undefined,
                        managerId: undefined,
                        assignedPmId: undefined,
                        status: (o.status || 'yangi').toLowerCase()
                    });
                    await newO.save();
                    ordersAdded++;
                }
            } catch (e) {
                console.error('Buyurtma xatosi:', o.uniqueId, e.message);
            }
        }
        results.orders = ordersAdded;

        // 5. Tranzaksiyalarni migratsiya qilish
        let transactionsAdded = 0;
        for (const t of transactions) {
            try {
                const newT = new Transaction({
                    ...t,
                    _id: undefined,
                    type: (t.type || 'income').toLowerCase(),
                    paymentMethod: (t.paymentMethod || 'cash').toLowerCase()
                });
                await newT.save();
                transactionsAdded++;
            } catch (e) {
                console.error('Tranzaksiya xatosi:', e.message);
            }
        }
        results.transactions = transactionsAdded;

        res.json({
            msg: `Migratsiya muvaffaqiyatli yakunlandi! Foydalanuvchilar: ${results.users}, Showroomlar: ${results.showrooms}, Mijozlar: ${results.customers}, Buyurtmalar: ${results.orders}, Tranzaksiyalar: ${results.transactions}`,
            results
        });
    } catch (err) {
        console.error('Umumiy migratsiya xatosi:', err);
        res.status(500).json({ msg: 'Migratsiya vaqtida xatolik yuz berdi', error: err.message });
    }
};

// Barcha bazani tozalash (0 holatga qaytarish)
exports.resetDatabase = async (req, res) => {
    try {
        const User = require('../models/User');
        const Order = require('../models/Order');
        const Transaction = require('../models/Transaction');
        const Showroom = require('../models/Showroom');
        const Customer = require('../models/Customer');

        await User.deleteMany({ role: { $ne: 'super' } });
        await Order.deleteMany({});
        await Transaction.deleteMany({});
        await Showroom.deleteMany({});
        await Customer.deleteMany({});

        console.log('Baza tozalandi: 0 holatga qaytarildi');
        res.json({ msg: "Baza muvaffaqiyatli tozalandi. Barcha ma'lumotlar o'chirildi." });
    } catch (err) {
        console.error('Reset xatosi:', err);
        res.status(500).json({ msg: 'Tozalashda xatolik yuz berdi', error: err.message });
    }
};

