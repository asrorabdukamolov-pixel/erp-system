const { db, formatQuery, formatDoc } = require('../config/firebase');

const DEFAULT_CHAINS = [
    {
        key: 'sotuvoldi_xarajat_arizasi_workflow',
        name: 'Sotuvoldi xarajat arizasi',
        description: 'Sotuvoldi xarajat arizalarini tasdiqlash zanjiri.',
        version: 1,
        isActive: true,
        steps: [
            { step_order: 1, label: 'Savdo rahbari', approver_type: 'role', role_id: 'sales_head', scope: 'all_company', condition: '', required: true, active: true },
            { step_order: 2, label: 'Moliyaviy rahbar', approver_type: 'role', role_id: 'finance_manager', scope: 'all_company', condition: 'amount > 5000000', required: true, active: true }
        ]
    },
    {
        key: 'xarid_arizasi_workflow',
        name: 'Xarid arizasi',
        description: 'Materiallar va xizmatlar xaridi uchun arizalar tasdiqlash zanjiri.',
        version: 1,
        isActive: true,
        steps: [
            { step_order: 1, label: 'Ombor mudiri / Sex boshlig\'i', approver_type: 'role', role_id: 'warehouse_head', scope: 'all_company', condition: '', required: true, active: true },
            { step_order: 2, label: 'Bosh direktor', approver_type: 'director', scope: 'all_company', condition: 'amount > 15000000', required: true, active: true }
        ]
    },
    {
        key: 'kassadan_chiqim_arizasi_workflow',
        name: 'Kassadan chiqim arizasi',
        description: 'Kassadan chiqim arizalarini tasdiqlash zanjiri.',
        version: 1,
        isActive: true,
        steps: [
            { step_order: 1, label: 'Bosh buxgalter', approver_type: 'role', role_id: 'chief_accountant', scope: 'all_company', condition: '', required: true, active: true },
            { step_order: 2, label: 'Moliyaviy rahbar', approver_type: 'role', role_id: 'finance_manager', scope: 'all_company', condition: '', required: true, active: true },
            { step_order: 3, label: 'Bosh direktor', approver_type: 'director', scope: 'all_company', condition: 'amount > 50000000', required: true, active: true }
        ]
    },
    {
        key: 'hr_tabel_workflow',
        name: 'HR tabel',
        description: 'HR tabel va ish haqi arizalarini tasdiqlash zanjiri.',
        version: 1,
        isActive: true,
        steps: [
            { step_order: 1, label: 'HR menejeri', approver_type: 'role', role_id: 'hr_manager', scope: 'all_company', condition: '', required: true, active: true },
            { step_order: 2, label: 'Bosh direktor', approver_type: 'director', scope: 'all_company', condition: '', required: true, active: true }
        ]
    },
    {
        key: 'bonus_approval_workflow',
        name: 'Bonus approval',
        description: 'Bonus arizalarini tasdiqlash zanjiri.',
        version: 1,
        isActive: true,
        steps: [
            { step_order: 1, label: 'Savdo rahbari', approver_type: 'role', role_id: 'sales_head', scope: 'all_company', condition: '', required: true, active: true },
            { step_order: 2, label: 'Moliyaviy rahbar', approver_type: 'role', role_id: 'finance_manager', scope: 'all_company', condition: '', required: true, active: true }
        ]
    },
    {
        key: 'chegirma_approval_workflow',
        name: 'Chegirma approval',
        description: 'Chegirma arizalarini tasdiqlash zanjiri.',
        version: 1,
        isActive: true,
        steps: [
            { step_order: 1, label: 'Savdo rahbari', approver_type: 'role', role_id: 'sales_head', scope: 'all_company', condition: '', required: true, active: true },
            { step_order: 2, label: 'Bosh direktor', approver_type: 'director', scope: 'all_company', condition: 'discount_percent > 10', required: true, active: true }
        ]
    }
];

exports.getAll = async (req, res) => {
    try {
        const snapshot = await db.collection('approval-matrix').get();
        let list = formatQuery(snapshot);

        // Map legacy keys if needed
        list = list.map(item => {
            if (item.key === 'pre_sale') item.key = 'sotuvoldi_xarajat_arizasi_workflow';
            if (item.key === 'purchase_request') item.key = 'xarid_arizasi_workflow';
            if (item.key === 'cash_outflow') item.key = 'kassadan_chiqim_arizasi_workflow';
            return item;
        });

        // Filter active ones
        let activeChains = list.filter(item => item.isActive !== false);

        // Seed if empty
        if (activeChains.length === 0) {
            activeChains = [];
            for (const chain of DEFAULT_CHAINS) {
                const docRef = await db.collection('approval-matrix').add({
                    ...chain,
                    createdAt: new Date().toISOString()
                });
                activeChains.push({ _id: docRef.id, ...chain });
            }
        } else {
            // Check if any default keys are missing and seed them
            for (const def of DEFAULT_CHAINS) {
                if (!activeChains.some(c => c.key === def.key)) {
                    const docRef = await db.collection('approval-matrix').add({
                        ...def,
                        createdAt: new Date().toISOString()
                    });
                    activeChains.push({ _id: docRef.id, ...def });
                }
            }
        }

        res.json(activeChains);
    } catch (err) {
        console.error("Get approval matrix error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const data = {
            ...req.body,
            version: req.body.version || 1,
            isActive: req.body.isActive !== false,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('approval-matrix').add(data);
        res.json({ _id: docRef.id, ...data });
    } catch (err) {
        console.error("Create approval matrix error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const docId = req.params.id;
        const oldDocRef = db.collection('approval-matrix').doc(docId);
        const oldDoc = await oldDocRef.get();

        if (!oldDoc.exists) {
            return res.status(404).json({ msg: 'Matritsa topilmadi' });
        }

        const oldData = oldDoc.data();

        // Rule: If editing an active workflow, do not mutate in place. Create a new version.
        if (oldData.isActive !== false) {
            // 1. Deactivate old version
            await oldDocRef.update({ isActive: false });

            // 2. Create new version
            const newVersionNum = (oldData.version || 1) + 1;
            const newChain = {
                key: oldData.key || req.body.key,
                name: req.body.name || oldData.name,
                description: req.body.description || oldData.description,
                version: newVersionNum,
                isActive: true,
                steps: req.body.steps || oldData.steps,
                createdAt: new Date().toISOString()
            };

            const newDocRef = await db.collection('approval-matrix').add(newChain);
            res.json({ _id: newDocRef.id, ...newChain });
        } else {
            // If it was already inactive, just update in place (fallback)
            await oldDocRef.update(req.body);
            const updated = await oldDocRef.get();
            res.json(formatDoc(updated));
        }
    } catch (err) {
        console.error("Update approval matrix error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const docRef = db.collection('approval-matrix').doc(req.params.id);
        const doc = await docRef.get();

        if (!doc.exists) return res.status(404).json({ msg: 'Matritsa topilmadi' });

        await docRef.delete();
        res.json({ msg: 'Matritsa o\'chirildi' });
    } catch (err) {
        console.error("Delete approval matrix error:", err.message);
        res.status(500).json({ msg: 'Server xatosi: ' + err.message });
    }
};
