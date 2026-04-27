const { db, formatQuery, formatDoc } = require('../config/firebase');

exports.getCustomers = async (req, res) => {
    try {
        const { type = 'customer', showroom } = req.query;
        let queryRef = db.collection('customers').where('type', '==', type);
        
        if (showroom && showroom !== 'all') {
            queryRef = queryRef.where('showroom', '==', showroom);
        } else if (req.user.role !== 'super') {
            queryRef = queryRef.where('showroom', '==', req.user.showroom || '');
        }

        const snapshot = await queryRef.orderBy('createdAt', 'desc').get();
        res.json(formatQuery(snapshot));
    } catch (err) {
        console.error("Get Customers Error:", err.message);
        res.status(500).json({ message: 'Mijozlarni yuklashda xatolik yuz berdi: ' + err.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const customerData = { ...req.body };
        
        if (req.user.role !== 'super') {
            customerData.showroom = req.user.showroom || '';
        } else if (!customerData.showroom) {
            customerData.showroom = 'Bosh ofis';
        }

        const newCustomer = {
            ...customerData,
            addedBy: req.user.name,
            managerName: req.user.name,
            createdAt: new Date().toISOString()
        };
 
        const docRef = await db.collection('customers').add(newCustomer);
        res.json({ _id: docRef.id, ...newCustomer });
    } catch (err) {
        console.error("Create Customer Error:", err.message);
        res.status(500).json({ message: 'Mijozni saqlashda xatolik yuz berdi: ' + err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const customerRef = db.collection('customers').doc(req.params.id);
        const doc = await customerRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Mijoz topilmadi' });

        await customerRef.update(req.body);
        const updated = await customerRef.get();
        res.json(formatDoc(updated));
    } catch (err) {
        console.error("Update Customer Error:", err.message);
        res.status(500).json({ message: 'Mijozni yangilashda xatolik yuz berdi: ' + err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const customerRef = db.collection('customers').doc(req.params.id);
        const doc = await customerRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Mijoz topilmadi' });
        
        await customerRef.delete();
        res.json({ message: 'Mijoz o\'chirildi' });
    } catch (err) {
        console.error("Delete Customer Error:", err.message);
        res.status(500).json({ message: 'Mijozni o\'chirishda xatolik yuz berdi: ' + err.message });
    }
};
