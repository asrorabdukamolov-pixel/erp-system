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
    if (!req.user || req.user.role !== 'super') {
      return res.status(403).json({ message: 'Faqat Super Admin o\'zgartirishi mumkin' });
    }

    const { companyName, companyPhone, companyLogo, kpLogo, companyAddress, instagram, telegram } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({
        companyName,
        companyPhone,
        companyLogo,
        kpLogo,
        companyAddress,
        instagram,
        telegram
      });
    } else {
      settings.companyName = companyName || settings.companyName;
      settings.companyPhone = companyPhone || settings.companyPhone;
      settings.companyLogo = companyLogo !== undefined ? companyLogo : settings.companyLogo;
      settings.kpLogo = kpLogo !== undefined ? kpLogo : settings.kpLogo;
      settings.companyAddress = companyAddress || settings.companyAddress;
      settings.instagram = instagram || settings.instagram;
      settings.telegram = telegram || settings.telegram;
    }

    await settings.save();
    res.json(settings);
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ message: "Serverda saqlashda xatolik yuz berdi: " + error.message });
  }
};
