import React, { useState, useRef, useEffect } from 'react';
import AskHRChat from '../pages/chatbot';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef(null);

  // Close chat when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (chatRef.current && !chatRef.current.contains(event.target) && 
          !event.target.classList.contains('chat-toggle-btn')) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Floating toggle button */}
      <button 
        className="chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close HR Assistant" : "Open HR Assistant"}
      >
        {isOpen ? '✕' : '✨'}
      </button>

      {/* Floating chat container */}
      {isOpen && (
        <div className="floating-chat-container" ref={chatRef}>
          <AskHRChat />
        </div>
      )}

      <style jsx>{`
        .chat-toggle-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #2563eb;
          color: white;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .chat-toggle-btn:hover {
          transform: scale(1.05);
          background-color: #1d4ed8;
        }

        .floating-chat-container {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 1200px;
          height: 700px;
          max-height: 85vh;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          z-index: 999;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .floating-chat-container {
            width: 90vw;
            height: 70vh;
            bottom: 80px;
            right: 5vw;
          }
        }
      `}</style>
    </>
  );
}
