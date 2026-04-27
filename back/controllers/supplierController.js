const Supplier = require('../models/Supplier');

exports.getSuppliers = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'super') {
            // Showroom Admin sees their own + Global (Super Admin added)
            query = {
                $or: [
                    { showroom: req.user.showroom },
                    { isGlobal: true }
                ]
            };
        }
        const suppliers = await Supplier.find(query).sort({ firm: 1 });
        res.json(suppliers);
    } catch (err) {
        res.status(500).json({ message: 'Yetkazib beruvchilarni olishda xatolik: ' + err.message });
    }
};

exports.createSupplier = async (req, res) => {
    try {
        const newSupplier = new Supplier({
            ...req.body,
            showroom: req.user.role === 'super' ? 'Global' : req.user.showroom,
            addedBy: req.user.name,
            isGlobal: req.user.role === 'super'
        });
        const supplier = await newSupplier.save();
        res.json(supplier);
    } catch (err) {
        res.status(500).json({ message: 'Saqlashda xatolik: ' + err.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) return res.status(404).json({ message: 'Topilmadi' });

        // If not super admin, check ownership
        if (req.user.role !== 'super' && (supplier.isGlobal || supplier.showroom === 'Global')) {
            return res.status(403).json({ message: 'Siz Super Admin kiritgan ma\'lumotni o\'zgartira olmaysiz' });
        }

        const updated = await Supplier.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Yangilashda xatolik: ' + err.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        console.log("Attempting to delete supplier:", req.params.id);
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            console.log("Supplier not found:", req.params.id);
            return res.status(404).json({ message: 'Topilmadi' });
        }

        // If not super admin, check ownership
        if (req.user.role !== 'super' && (supplier.isGlobal || supplier.showroom === 'Global')) {
            return res.status(403).json({ message: 'Siz Super Admin kiritgan ma\'lumotni o\'chira olmaysiz' });
        }

        await Supplier.findByIdAndDelete(req.params.id);
        console.log("Supplier deleted successfully");
        res.json({ message: 'Muvaffaqiyatli o\'chirildi' });
    } catch (err) {
        console.error("Delete Supplier Error:", err);
        res.status(500).json({ message: 'O\'chirishda xatolik: ' + err.message });
    }
};
