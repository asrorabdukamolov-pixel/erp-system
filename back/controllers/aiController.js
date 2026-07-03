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

    // 2. Prepare for Direct API Call - Gemini 2.5 Flash
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(500).json({
        message: "GEMINI_API_KEY sozlanmagan. .env faylga API kalitni qo'shing."
      });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `Siz 'Express Mebel' kompaniyasining professional sotuv mentori va sun'iy intellekt yordamchisiz.

Vazifalaringiz:
- Xodimlarga mijozlar bilan gaplashishda yordam berish
- Sotuvlarni oshirish bo'yicha maslahatlar berish
- Motivatsiyani ko'tarish
- Mebel sohasida professional bilimlar bilan yordam berish
- ERP tizimi bo'yicha savolarga javob berish

Qoidalar:
- Javoblaringiz professional, do'stona va motivatsion bo'lsin
- Har doim o'zbek tilida javob bering
- Qisqa va aniq javob bering, ortiqcha ma'lumot bermang
- Emoji ishlatishingiz mumkin`;

    const payload = {
      system_instruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [{
        role: 'user',
        parts: [{ text: message }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    };

    // 3. Call Gemini 2.5 Flash API
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
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
