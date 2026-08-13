import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'other', text: 'Hello! Welcome to CareConnect Support & Consultation chat.' },
    { sender: 'other', text: 'How can I assist you with your appointment today?' }
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'other', text: 'Thank you! Your doctor will reply shortly during consultation.' }
      ]);
    }, 1000);
  };

  return (
    <>
      <div className="chat-widget-trigger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </div>

      {isOpen && (
        <div className="chat-widget-box">
          <div className="chat-widget-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={18} />
              <span style={{ fontWeight: 600, fontSize: '15px' }}>CareConnect Chat</span>
            </div>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
          </div>

          <div className="chat-messages-container">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="form-control"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{ borderRadius: '20px', padding: '8px 14px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0 }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
