const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    if (req.user.role !== 'super') {
      return res.status(403).json({ message: 'Faqat Super Admin o\'zgartirishi mumkin' });
    }

    let settings = await Settings.findOne();
    
    // Exclude internal fields from request body to prevent Mongoose errors
    const { _id, __v, ...updateData } = req.body;

    if (!settings) {
      settings = new Settings(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Serverda saqlashda xatolik: " + error.message });
  }
};
