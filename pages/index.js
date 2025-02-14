import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [audio, setAudio] = useState(null);
  const [messages, setMessages] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');
    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, JSON.parse(event.data)]);
    };
    return () => ws.current.close();
  }, []);

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('audio', file);

    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    
    ws.current.send(JSON.stringify({ type: 'audio', url: data.url }));
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold">Audio Chat</h1>
      <input type="file" accept="audio/*" onChange={handleAudioUpload} />
      <div className="mt-4 w-full">
        {messages.map((msg, index) => (
          <audio key={index} controls src={msg.url}></audio>
        ))}
      </div>
    </div>
  );
}
