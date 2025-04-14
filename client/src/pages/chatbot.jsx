import React, { useState, useRef, useEffect } from 'react';

export default function AskHRChat({ isFloating = false }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch('http://localhost:3000/api/gpt/ask-hr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();

      const assistantMessage = {
        role: 'assistant',
        content: data.data || [],
        isTable: true
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
    }

    setInput('');
    setLoading(false);
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
  };

  const renderTable = (data) => {
    if (!Array.isArray(data) || data.length === 0) return <div>No results found.</div>;

    const headers = Object.keys(data[0]);

    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((key, i) => (
                <th key={i}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {headers.map((key, i) => (
                  <td key={i}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="chat-container">
    

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">😎</div>
            <h3>How can I help you today?</h3>
            <p>Ask me about company policies, benefits, leave, or any HR-related questions</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              <div className="message-avatar">
                {msg.role === 'user' ? '🥷🏼' : '🧕🏼'}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">{msg.role === 'user' ? 'You' : 'HR Assistant'}</span>
                  <span className="message-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="message-body">
                  {msg.isTable ? renderTable(msg.content) : msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Type your question here..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
          className="chat-input"
        />
      
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="send-button"
          title="Send message"
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
          
        {messages.length > 0 && (
          <button onClick={handleClearChat} className="clear-button" title="Clear conversation">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        )}
      </div>

      <style jsx>{`
        .chat-container {
         max-width: ${isFloating ? '1200px' : '1200px'};
          margin: ${isFloating ? '0' : '0 auto'};
          height: ${isFloating ? '100vh' : '100vh'};
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f9fafb;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .chat-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #1e40af, #2563eb);
          color: white;
          border-radius: 12px 12px 0 0;
          text-align: center;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .chat-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .header-subtitle {
          margin-top: 0.5rem;
          opacity: 0.9;
          font-size: 0.95rem;
        }

       .messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #f9fafb;
  min-height: 0; /* This is important for flex containers */
  max-height: calc(100% - 140px); /* Adjust based on your header and input heights */
}

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6b7280;
          text-align: center;
          padding: 2rem;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          max-width: 400px;
          line-height: 1.5;
        }

        .message {
          display: flex;
          gap: 1rem;
          max-width: 85%;
          animation: fadeIn 0.3s ease-out;
        }

        .user-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .assistant-message {
          align-self: flex-start;
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .user-message .message-avatar {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .assistant-message .message-avatar {
          background-color: #dbeafe;
          color: #2563eb;
        }

        .message-content {
          background-color: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          max-width: 100%;
        }

        .user-message .message-content {
          background-color: #2563eb;
          color: white;
          border-radius: 12px 12px 0 12px;
        }

        .assistant-message .message-content {
          background-color: white;
          border-radius: 12px 12px 12px 0;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.85rem;
        }

        .user-message .message-header {
          color: rgba(255, 255, 255, 0.9);
        }

        .assistant-message .message-header {
          color: #6b7280;
        }

        .message-sender {
          font-weight: 600;
        }

        .message-time {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .message-body {
          font-size: 0.95rem;
          line-height: 1.5;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .table-container {
          overflow-x: auto;
          margin-top: 0.5rem;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .data-table th {
          background-color: #eff6ff;
          color: #1e40af;
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .data-table tr:nth-child(even) {
          background-color: #f9fafb;
        }

        .input-container {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background-color: white;
          border-top: 1px solid #e5e7eb;
          border-radius: 0 0 12px 12px;
        }

        .chat-input {
          flex: 1;
          padding: 0.875rem 1.25rem;
          border-radius: 9999px;
          border: 1px solid #e5e7eb;
          font-size: 0.95rem;
          background-color: #f9fafb;
          transition: all 0.2s;
        }

        .chat-input:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
          background-color: white;
        }

        .clear-button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #f3f4f6;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-button:hover {
          background-color: #e5e7eb;
          color: #4b5563;
        }

        .send-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-button:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
        }

        .send-button:active {
          transform: translateY(1px);
        }

        .send-button:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .chat-container {
            height: 100vh;
            border-radius: 0;
          }
          
          .
          .chat-header {
            border-radius: 0;
          }
          
          .message {
            max-width: 90%;
          }
          
          .clear-button {
            width: 40px;
            height: 40px;
          }
          
          .send-button {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
