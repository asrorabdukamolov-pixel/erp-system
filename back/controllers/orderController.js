const Order = require('../models/Order');

// @desc    Get all orders
// @access  Private
exports.getOrders = async (req, res) => {
    try {
        let query = {};
        
        // Filter by showroom if not super admin
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }
        query.status = { $ne: 'trash' };

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Get single order
// @access  Private
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Buyurtma topilmadi' });
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Create new order
// @access  Private
exports.createOrder = async (req, res) => {
    try {
        const newOrder = new Order({
            ...req.body,
            managerId: req.user.id,
            managerName: req.user.name,
            showroom: req.user.showroom,
            timeline: [{
                type: 'system',
                text: 'Buyurtma yaratildi',
                user: req.user.name,
                time: new Date()
            }]
        });

        const order = await newOrder.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Update order
// @access  Private
exports.updateOrder = async (req, res) => {
    try {
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Buyurtma topilmadi' });

        // Add timeline log if status changed
        if (req.body.status && req.body.status !== order.status) {
            req.body.timeline = [
                ...order.timeline,
                {
                    type: 'status',
                    text: `Status o'zgardi: ${order.status} -> ${req.body.status}`,
                    user: req.user.name,
                    time: new Date()
                }
            ];
        }

        order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Delete order (soft delete / move to trash)
// @access  Private
exports.deleteOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        let order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Buyurtma topilmadi' });

        order.status = 'trash';
        order.deleteReason = reason;
        order.deletedBy = req.user.name;
        order.deletedAt = new Date();
        order.timeline.push({
            type: 'system',
            text: `Buyurtma o'chirildi (Savatga tashlandi). Sabab: ${reason}`,
            user: req.user.name,
            time: new Date()
        });

        await order.save();
        res.json({ msg: 'Buyurtma o\'chirildi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Add timeline log to order
// @access  Private
exports.addOrderLog = async (req, res) => {
    try {
        const { text, type = 'comment' } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Buyurtma topilmadi' });

        order.timeline.push({
            type,
            text,
            user: req.user.name,
            time: new Date()
        });

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
// @desc    Get trashed orders
// @access  Private
exports.getTrashedOrders = async (req, res) => {
    try {
        const query = { status: 'trash' };
        if (req.user.role === 'showroom_admin') query.showroom = req.user.showroom;
        
        const orders = await Order.find(query).sort({ deletedAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

// @desc    Restore order from trash
// @access  Private
exports.restoreOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Buyurtma topilmadi' });

        order.status = 'pm'; // Restore to PM or some default state
        order.timeline.push({
            type: 'system',
            text: `Buyurtma tiklandi.`,
            user: req.user.name,
            time: new Date()
        });

        await order.save();
        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
