const axios = require('axios');
const { db } = require('../config/firebase');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// @desc    Handle Telegram Webhook
// @route   POST api/telegram/webhook
exports.handleWebhook = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.text) {
      return res.sendStatus(200);
    }

    const chatId = message.chat.id;
    const text = message.text;

    // Handle /start command with user ID: /start <userId>
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      if (parts.length > 1) {
        const userId = parts[1];
        
        // Link user in Firestore
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (userDoc.exists) {
          await userRef.update({
            telegramChatId: chatId
          });
          
          await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text: `Tabriklaymiz, ${userDoc.data().name}! Sizning ERP hisobingiz muvaffaqiyatli bog'landi. Endi vazifalar haqida eslatmalarni shu yerda olasiz.`
          });
        } else {
          await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text: 'Xatolik: Foydalanuvchi topilmadi. Iltimos, ERP tizimidagi havoladan qayta foydalaning.'
          });
        }
      } else {
        await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
          chat_id: chatId,
          text: 'Assalomu alaykum! ERP tizimidan eslatmalarni olish uchun iltimos profil bo\'limidagi "Telegramni ulash" tugmasidan foydalaning.'
        });
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Telegram Webhook Error:', err.message);
    res.sendStatus(200); // Always return 200 to Telegram
  }
};

// @desc    Setup Telegram Webhook
// @route   GET api/telegram/setup
exports.setupWebhook = async (req, res) => {
  try {
    const host = req.get('host');
    const protocol = req.protocol;
    // Note: In production Firebase, we might need to hardcode the actual URL if req.get('host') is not correct
    const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;
    
    const response = await axios.get(`${TELEGRAM_API_URL}/setWebhook?url=${webhookUrl}`);
    res.json({
      msg: 'Telegram Webhook o\'rnatildi',
      url: webhookUrl,
      telegramResponse: response.data
    });
  } catch (err) {
    console.error('Setup Webhook Error:', err.message);
    res.status(500).json({ msg: 'Webhook o\'rnatishda xatolik', error: err.message });
  }
};
