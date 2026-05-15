import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { MessageSquare, X, Send, Minus, Zap, Bot, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import aiLogo from '../assets/ai-logo.png'; 

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Salom! Men sizning shaxsiy AI yordamchingizman. Sizga qanday yordam bera olaman?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const { user, loading } = useAuth();
  const dragControls = useDragControls();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  if (loading || !user) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'https://api-35o3qdobxa-uc.a.run.app/api'; 
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/integrations/ai-chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: currentInput,
          userId: user?.uid,
          userName: user?.displayName || user?.email,
          userRole: user?.role
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server xatosi: ${response.status} - ${errorText.substring(0, 50)}...`);
      }

      const data = await response.json();
      
      const aiResponse = { 
        id: Date.now() + 1, 
        text: data.response || "Tushunib oldim. Savolingiz bo'lsa marhamat!", 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = { id: Date.now() + 1, text: `Aloqa xatosi: ${error.message}`, sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={!isOpen}
      dragMomentum={false}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999999,
        fontFamily: 'sans-serif'
      }}
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="icon"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden',
              border: '2px solid #2563eb'
            }}
          >
            <img src={aiLogo} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
            <div style={{
              position: 'absolute', top: '5px', right: '5px', backgroundColor: '#ef4444',
              color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '10px',
              fontWeight: 'bold', border: '2px solid white', pointerEvents: 'none'
            }}>AI</div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.5, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              width: '550px', height: '800px', backgroundColor: 'white', borderRadius: '25px',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column',
              overflow: 'hidden', border: '1px solid #e5e7eb', cursor: 'default'
            }}
          >
            {/* Header */}
            <div 
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                padding: '20px', background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
                color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                cursor: 'move', userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={aiLogo} alt="AI" style={{ width: '45px', height: '45px', borderRadius: '50%', border: '2px solid white', backgroundColor: 'white' }} />
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>AI Mentor</span>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <Minus size={22} style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => setIsOpen(false)} />
                <X size={22} style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => setIsOpen(false)} />
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                  <div style={{
                    padding: '12px 18px', borderRadius: '15px', fontSize: '15px',
                    backgroundColor: msg.sender === 'user' ? '#2563eb' : 'white',
                    color: msg.sender === 'user' ? 'white' : '#1f2937',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                    border: msg.sender === 'user' ? 'none' : '1px solid #e5e7eb',
                    lineHeight: '1.5'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', padding: '10px', fontSize: '14px', color: '#6b7280' }}>
                  AI yozmoqda...
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Footer */}
            <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                disabled={isTyping}
                placeholder="Xabaringizni yozing..."
                style={{
                  flex: 1, padding: '12px 15px', borderRadius: '10px', border: '1px solid #d1d5db',
                  fontSize: '15px', outline: 'none', background: isTyping ? '#f3f4f6' : 'white',
                  color: '#1f2937'
                }}
              />
              <button
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                style={{
                  padding: '12px', backgroundColor: (isTyping || !input.trim()) ? '#9ca3af' : '#2563eb', 
                  color: 'white', borderRadius: '10px',
                  border: 'none', cursor: (isTyping || !input.trim()) ? 'default' : 'pointer', 
                  display: 'flex', alignItems: 'center'
                }}
              >
                <Send size={22} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAssistant;
