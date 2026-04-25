const Customer = require('../models/Customer');

// @desc    Get all customers or agents
// @access  Private
exports.getCustomers = async (req, res) => {
    try {
        const { type = 'customer', showroom } = req.query;
        let query = { type };
        
        if (showroom && showroom !== 'all') {
            query.showroom = showroom;
        } else if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }

        const customers = await Customer.find(query).sort({ createdAt: -1 });
        res.json(customers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Create a customer/agent
// @access  Private
exports.createCustomer = async (req, res) => {
    try {
        const newCustomer = new Customer({
            ...req.body,
            showroom: req.user.showroom,
            addedBy: req.user.name,
            managerName: req.user.name
        });

        const customer = await newCustomer.save();
        res.json(customer);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
