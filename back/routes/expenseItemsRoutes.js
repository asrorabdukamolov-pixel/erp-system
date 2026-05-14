const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all expense items
router.get('/', async (req, res) => {
    try {
        const snapshot = await db.collection('expense_items').get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add new item
router.post('/', async (req, res) => {
    try {
        const newItem = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('expense_items').add(newItem);
        res.json({ id: docRef.id, ...newItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update item
router.put('/:id', async (req, res) => {
    try {
        await db.collection('expense_items').doc(req.params.id).update(req.body);
        res.json({ message: "Updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete item
router.delete('/:id', async (req, res) => {
    try {
        await db.collection('expense_items').doc(req.params.id).delete();
        res.json({ message: "Deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
