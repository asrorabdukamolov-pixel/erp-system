const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../local_db.json');

const getDb = () => {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
};

const saveDb = (db) => {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

// ==========================
// COST CENTERS (MARKAZLAR)
// ==========================

router.get('/', (req, res) => {
    try {
        const db = getDb();
        res.json(db.cost_centers || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', (req, res) => {
    try {
        const db = getDb();
        const newCenter = {
            id: 'cc_' + Date.now(),
            ...req.body
        };
        if (!db.cost_centers) db.cost_centers = [];
        db.cost_centers.push(newCenter);
        saveDb(db);
        res.status(201).json(newCenter);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const db = getDb();
        const id = req.params.id;
        const index = db.cost_centers.findIndex(c => c.id === id || c._id === id);
        if (index === -1) return res.status(404).json({ message: 'Markaz topilmadi' });
        db.cost_centers[index] = { ...db.cost_centers[index], ...req.body };
        saveDb(db);
        res.json(db.cost_centers[index]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const db = getDb();
        const id = req.params.id;
        db.cost_centers = db.cost_centers.filter(c => c.id !== id && c._id !== id);
        saveDb(db);
        res.json({ message: 'O\'chirildi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================
// CATEGORIES (BO'LIMLAR)
// ==========================

router.get('/categories', (req, res) => {
    try {
        const db = getDb();
        res.json(db.cost_center_categories || []);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/categories', (req, res) => {
    try {
        const db = getDb();
        const newCat = {
            id: 'cat_' + Date.now(),
            ...req.body,
            color: req.body.color || '#64748b'
        };
        if (!db.cost_center_categories) db.cost_center_categories = [];
        db.cost_center_categories.push(newCat);
        saveDb(db);
        res.status(201).json(newCat);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/categories/:id', (req, res) => {
    try {
        const db = getDb();
        const id = req.params.id;
        db.cost_center_categories = db.cost_center_categories.filter(c => c.id !== id);
        saveDb(db);
        res.json({ message: 'Bo\'lim o\'chirildi' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
