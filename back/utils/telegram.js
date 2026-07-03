const axios = require('axios');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

/**
 * Send a message to a specific Telegram Chat ID
 * @param {string|number} chatId - User's Telegram Chat ID
 * @param {string} text - Message text (supports Markdown)
 */
const sendMessage = async (chatId, text) => {
  if (!TELEGRAM_BOT_TOKEN || !chatId) return;
  
  try {
    await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    });
    return true;
  } catch (error) {
    console.error('Telegram SendMessage Error:', error.response?.data || error.message);
    return false;
  }
};

module.exports = {
  sendMessage
};
