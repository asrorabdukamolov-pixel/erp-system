const Purchase = require('../models/Purchase');

exports.getPurchases = async (req, res) => {
    try {
        const query = {};
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }
        const purchases = await Purchase.find(query).sort({ createdAt: -1 });
        res.json(purchases);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createPurchase = async (req, res) => {
    try {
        const newPurchase = new Purchase({
            ...req.body,
            showroom: req.user.showroom
        });
        const purchase = await newPurchase.save();
        res.json(purchase);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updatePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(purchase);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deletePurchase = async (req, res) => {
    try {
        const purchase = await Purchase.findByIdAndDelete(req.params.id);
        if (!purchase) return res.status(404).json({ msg: 'Xarid topilmadi' });
        res.json({ msg: 'Xarid o\'chirildi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
