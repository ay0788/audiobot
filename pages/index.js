import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const ws = useRef(null);
  let mediaRecorder;
  
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3001');
    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, JSON.parse(event.data)]);
    };
    return () => ws.current.close();
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    setRecording(true);

    mediaRecorder.ondataavailable = async (e) => {
      const audioBlob = new Blob([e.data], { type: 'audio/mp3' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      ws.current.send(JSON.stringify({ type: 'audio', url: data.url }));
    };
  };

  const stopRecording = () => {
    mediaRecorder.stop();
    setRecording(false);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="flex items-center p-4 bg-gray-900">
        <button className="text-white text-xl">⬅</button>
        <div className="ml-4">
          <h1 className="text-lg font-bold">Receiver</h1>
          <p className="text-sm text-gray-400">Tap here for contact info</p>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-[url('/background-pattern.png')]">
        {messages.map((msg, index) => (
          <div key={index} className="flex justify-end mb-2">
            <div className="bg-green-500 p-2 rounded-lg max-w-xs">
              <audio controls src={msg.url}></audio>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 flex items-center bg-gray-900">
        <button className="text-white text-2xl">➕</button>
        <div className="flex-1 mx-2 bg-gray-800 p-3 rounded-full text-gray-400">
          Tap to record
        </div>
        <button 
          className="text-white text-2xl"
          onMouseDown={startRecording} 
          onMouseUp={stopRecording}>
          🎤
        </button>
      </div>
    </div>
  );
}