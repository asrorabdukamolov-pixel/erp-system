const Purchase = require('../models/Purchase');

exports.getPurchases = async (req, res) => {
    try {
        // Purchases don't have showroom field in model yet, but they are linked to orders.
        // For now, get all or we can add showroom to Purchase model too.
        const purchases = await Purchase.find().sort({ createdAt: -1 });
        res.json(purchases);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createPurchase = async (req, res) => {
    try {
        const newPurchase = new Purchase({
            ...req.body
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
