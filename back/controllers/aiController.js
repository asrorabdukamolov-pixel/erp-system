const { db } = require('../config/firebase');
const axios = require('axios');

exports.handleAIChat = async (req, res) => {
  const { message, userId, userName, userRole } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Xabar yuborilmadi" });
  }

  try {
    // 1. Save user message to history
    try {
      await db.collection('ai_chats').add({
        userId: userId || 'anonymous',
        userName: userName || 'Noma\'lum',
        userRole: userRole || 'user',
        message: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      });
    } catch (dbErr) {
      console.error("Error saving user message:", dbErr);
    }

    // 2. Prepare for Direct API Call
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        parts: [{
          text: `Siz 'Express Mebel' kompaniyasining professional sotuv mentori va sun'iy intellekt yordamchisiz. Vazifangiz - xodimlarga mijozlar bilan gaplashishda, sotuvlarni oshirishda va motivatsiyani ko'tarishda yordam berish. Javoblaringiz professional, do'stona, motivatsion va o'zbek tilida bo'lishi kerak. Foydalanuvchi xabari: ${message}`
        }]
      }]
    };

    // 3. Call Gemini API directly using axios
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    const aiResponse = response.data.candidates[0].content.parts[0].text;

    // 4. Save AI response to history
    try {
      await db.collection('ai_chats').add({
        userId: userId || 'anonymous',
        userName: 'AI Mentor',
        userRole: 'ai',
        message: aiResponse,
        sender: 'ai',
        timestamp: new Date().toISOString()
      });
    } catch (dbErr) {
      console.error("Error saving AI response:", dbErr);
    }

    // 5. Return response to frontend
    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Gemini AI Error:", error.response?.data || error.message);
    const detail = error.response?.data?.error?.message || error.message;
    res.status(500).json({ 
      message: "AI bilan aloqada xatolik yuz berdi",
      error: detail 
    });
  }
};
