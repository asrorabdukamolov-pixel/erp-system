const Customer = require('../models/Customer');

// @desc    Get all customers or agents
// @access  Private
exports.getCustomers = async (req, res) => {
    try {
        const { type = 'customer', showroom } = req.query;
        let query = { type };
        
        // Showroom bo'yicha filtr
        if (showroom && showroom !== 'all') {
            query.showroom = showroom;
        } else if (req.user.role !== 'super') {
            // Agar super bo'lmasa, faqat o'zini showroomini ko'radi
            query.showroom = req.user.showroom;
        }

        const customers = await Customer.find(query).sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        console.error("Get Customers Error:", err.message);
        res.status(500).json({ message: 'Mijozlarni yuklashda xatolik yuz berdi: ' + err.message });
    }
};

// @desc    Create a customer/agent
// @access  Private
exports.createCustomer = async (req, res) => {
    try {
        const customerData = { ...req.body };
        
        // Agar super admin bo'lmasa, showroomni majburiy o'zini showroomiga belgilaymiz
        if (req.user.role !== 'super') {
            customerData.showroom = req.user.showroom;
        } else if (!customerData.showroom) {
            // Agar super bo'lsa va showroom tanlanmagan bo'lsa
            customerData.showroom = 'Bosh ofis';
        }

        const newCustomer = new Customer({
            ...customerData,
            addedBy: req.user.name,
            managerName: req.user.name
        });
 
        const customer = await newCustomer.save();
        res.json(customer);
    } catch (err) {
        console.error("Create Customer Error:", err.message);
        res.status(500).json({ message: 'Mijozni saqlashda xatolik yuz berdi: ' + err.message });
    }
};

// @desc    Update a customer
// @access  Private
exports.updateCustomer = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Mijoz topilmadi' });

        customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(customer);
    } catch (err) {
        console.error("Update Customer Error:", err.message);
        res.status(500).json({ message: 'Mijozni yangilashda xatolik yuz berdi: ' + err.message });
    }
};

// @desc    Delete a customer
// @access  Private
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).json({ message: 'Mijoz topilmadi' });
        
        await Customer.findByIdAndDelete(req.params.id);
        res.json({ message: 'Mijoz o\'chirildi' });
    } catch (err) {
        console.error("Delete Customer Error:", err.message);
        res.status(500).json({ message: 'Mijozni o\'chirishda xatolik yuz berdi: ' + err.message });
    }
};
