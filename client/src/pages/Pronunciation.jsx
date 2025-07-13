import React, { useEffect, useState, useRef } from 'react';
import axios from '../services/axios';
import NavbarStudent from '../components/NavbarStudent';

const Pronunciation = () => {
  const [paragraphs, setParagraphs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeRecording, setActiveRecording] = useState(null); // ID of the active card
  const recognitionRef = useRef(null);

  const [transcripts, setTranscripts] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  // Fetch paragraphs
  useEffect(() => {
    const fetchParagraphs = async () => {
      try {
        const res = await axios.get('/paragraphs');
        setParagraphs(res.data);
      } catch (err) {
        console.error('Error fetching paragraphs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchParagraphs();
  }, []);

  const startRecording = (para) => {
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
    setActiveRecording(para._id);

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;

      // Store the result for this paragraph
      setTranscripts(prev => ({ ...prev, [para._id]: spoken }));
      generateFeedback(para, spoken);

      setActiveRecording(null);
    };

    recognition.onerror = (e) => {
      console.error(e);
      setActiveRecording(null);
    };
  };

  const generateFeedback = (para, spoken) => {
    const original = para.paragraph.toLowerCase().split(/\s+/);
    const spokenWords = spoken.toLowerCase().split(/\s+/);

    let matched = 0;
    original.forEach((word, i) => {
      if (spokenWords[i] === word) matched++;
    });

    const accuracy = Math.round((matched / original.length) * 100);
    const result = `Accuracy: ${accuracy}% — You spoke ${matched} of ${original.length} words correctly.`;

    setFeedbacks(prev => ({ ...prev, [para._id]: result }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">

      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">🎤 Practice Pronunciation</h2>

        {loading && (
          <div className="text-gray-500 text-center">Loading paragraphs...</div>
        )}

        {!loading && paragraphs.length === 0 && (
          <div className="text-gray-500 text-center">No paragraphs available.</div>
        )}

        <div className="grid gap-8 md:grid-cols-1">
          {paragraphs.map((para) => (
            <div
              key={para._id}
              className="bg-white p-6 rounded-2xl shadow border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-blue-700 mb-4">
                {para.category || 'Practice'}
              </h3>

              <p className="text-gray-700 mb-4 border-l-4 border-blue-400 pl-4 italic">
                {para.paragraph}
              </p>

              <button
                onClick={() => startRecording(para)}
                disabled={activeRecording === para._id}
                className={`transition px-6 py-3 font-semibold text-white rounded-lg shadow hover:shadow-xl duration-300 ${
                  activeRecording === para._id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {activeRecording === para._id ? '🎙️ Listening...' : '🎙️ Start Speaking'}
              </button>

              {transcripts[para._id] && (
                <div className="mt-4 bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-600 mb-1">🗣 You said:</h4>
                  <p className="text-gray-900 italic">"{transcripts[para._id]}"</p>
                </div>
              )}

              {feedbacks[para._id] && (
                <div className="mt-2 text-green-700 font-semibold bg-green-50 border border-green-200 p-4 rounded-lg">
                  ✅ {feedbacks[para._id]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pronunciation;
