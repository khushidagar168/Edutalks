// client/src/pages/Pronunciation.jsx
import React, { useState, useRef } from 'react';
import NavbarStudent from '../components/NavbarStudent';

const Pronunciation = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [text] = useState(
    'Practice this paragraph to improve your spoken English. Focus on clarity, tone, and pace.'
  );
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition not supported on this browser!');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.start();
    setIsRecording(true);

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      setTranscript(spoken);
      generateFeedback(spoken);
      setIsRecording(false);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setIsRecording(false);
    };
  };

  const generateFeedback = (spoken) => {
    const original = text.toLowerCase().split(/\s+/);
    const spokenWords = spoken.toLowerCase().split(/\s+/);

    let matched = 0;
    original.forEach((word, i) => {
      if (spokenWords[i] === word) matched++;
    });

    const accuracy = Math.round((matched / original.length) * 100);
    setFeedback(`Accuracy: ${accuracy}% — You spoke ${matched} of ${original.length} words correctly.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <NavbarStudent />
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white p-6 md:p-10 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-blue-800 mb-6">🎤 Practice Pronunciation</h2>

          <p className="text-lg text-gray-700 mb-6 border-l-4 border-blue-400 pl-4 italic">{text}</p>

          <button
            onClick={startRecording}
            disabled={isRecording}
            className={`transition px-6 py-3 font-semibold text-white rounded-lg shadow hover:shadow-xl duration-300 ${
              isRecording ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isRecording ? '🎙️ Listening...' : '🎙️ Start Speaking'}
          </button>

          {transcript && (
            <div className="mt-8 bg-gray-50 border rounded-lg p-4">
              <h4 className="font-semibold text-gray-600 mb-1">🗣 You said:</h4>
              <p className="text-gray-900 italic">"{transcript}"</p>
            </div>
          )}

          {feedback && (
            <div className="mt-4 text-green-700 font-semibold bg-green-50 border border-green-200 p-4 rounded-lg">
              ✅ {feedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pronunciation;
