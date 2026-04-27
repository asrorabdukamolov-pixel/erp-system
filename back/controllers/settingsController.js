const { db, formatDoc } = require('../config/firebase');

exports.getSettings = async (req, res) => {
  try {
    const settingsRef = db.collection('settings').doc('global');
    const doc = await settingsRef.get();
    
    if (!doc.exists) {
      const defaultSettings = {
        companyName: 'Express Mebel',
        createdAt: new Date().toISOString()
      };
      await settingsRef.set(defaultSettings);
      return res.json({ _id: 'global', ...defaultSettings });
    }
    
    res.json(formatDoc(doc));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'super') {
      return res.status(403).json({ message: 'Faqat Super Admin o\'zgartirishi mumkin' });
    }

    const updateData = { ...req.body, updatedAt: new Date().toISOString() };
    const settingsRef = db.collection('settings').doc('global');
    
    await settingsRef.set(updateData, { merge: true });
    const updated = await settingsRef.get();
    res.json(formatDoc(updated));
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Serverda saqlashda xatolik yuz berdi: " + error.message });
  }
};
