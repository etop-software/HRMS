import { useEffect, useState } from 'react';

function App() {
  const [iframeUrl, setIframeUrl] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/gpt/ask-hr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // You can pass name/email/etc if needed
    })
      .then(res => res.json())
      .then(data => {
        setIframeUrl(data.chatbotUrl);
      })
      .catch(err => {
        console.error('Failed to load chatbot:', err);
      });
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'left' }}>
      {iframeUrl ? (
        <iframe
          src={iframeUrl}
          title="Chatbot"
          style={{
            width: '1200px',
            height: '640px',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        />
      ) : (
        <p>Loading chatbot...</p>
      )}
    </div>
  );
}

export default App;
