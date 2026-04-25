const Partner = require('../models/Partner');

exports.getPartners = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'super') {
            query.showroom = req.user.showroom;
        }
        const partners = await Partner.find(query).sort({ name: 1 });
        res.json(partners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.createPartner = async (req, res) => {
    try {
        const newPartner = new Partner({
            ...req.body,
            showroom: req.user.showroom,
            addedBy: req.user.name
        });
        const partner = await newPartner.save();
        res.json(partner);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.updatePartner = async (req, res) => {
    try {
        let partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Hamkor topilmadi' });

        partner = await Partner.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(partner);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};

exports.deletePartner = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Hamkor topilmadi' });

        await Partner.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hamkor o\'chirildi' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server xatosi');
    }
};
