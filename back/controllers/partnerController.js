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
        console.error("Get Partners Error:", err.message);
        res.status(500).json({ message: 'Serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.createPartner = async (req, res) => {
    try {
        if (!req.body.name || !req.body.logo) {
            return res.status(400).json({ message: 'Hamkor nomi va logotipi bo\'lishi shart!' });
        }
        console.log("Creating partner:", req.body.name);
        const newPartner = new Partner({
            ...req.body,
            showroom: req.user.role === 'super' ? 'Asosiy (Super Admin)' : req.user.showroom,
            addedBy: req.user.name
        });
        const partner = await newPartner.save();
        res.json(partner);
    } catch (err) {
        console.error("Create Partner Error:", err.message);
        res.status(500).json({ message: 'Hamkorni saqlashda serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.updatePartner = async (req, res) => {
    try {
        console.log("Updating partner ID:", req.params.id);
        let partner = await Partner.findById(req.params.id);
        if (!partner) return res.status(404).json({ message: 'Hamkor topilmadi' });

        partner = await Partner.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.json(partner);
    } catch (err) {
        console.error("Update Partner Error:", err.message);
        res.status(500).json({ message: 'Hamkorni yangilashda serverda xatolik yuz berdi: ' + err.message });
    }
};

exports.deletePartner = async (req, res) => {
    try {
        console.log("Deleting partner ID:", req.params.id);
        const partner = await Partner.findById(req.params.id);
        if (!partner) {
            console.log("Partner not found for deletion:", req.params.id);
            return res.status(404).json({ message: 'Hamkor topilmadi' });
        }

        await Partner.findByIdAndDelete(req.params.id);
        console.log("Partner deleted successfully from DB");
        res.json({ message: 'Hamkor o\'chirildi' });
    } catch (err) {
        console.error("Delete Partner Error:", err.message);
        res.status(500).json({ message: 'Hamkorni o\'chirishda serverda xatolik yuz berdi: ' + err.message });
    }
};
