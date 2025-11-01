"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import ChatBubble from "@/components/chat-bubble";
import { useChat } from "@/context/chat-context";
import { Spinner } from "@/components/ui/spinner";
import ProtectedRoute from "@/components/protected-route";
import LocationIndicator from "@/components/LocationIndicator";

export default function ChatbotPage() {
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audioQueue, setAudioQueue] = useState([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const {
    messages,
    language,
    voiceEnabled,
    setLanguage,
    setVoiceEnabled,
    sendMessage,
    clearMessages,
  } = useChat();

  // 🔹 Initialize SpeechRecognition for voice input
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      const langMap = {
        en: "en-IN",
        hi: "hi-IN",
        bn: "bn-IN",
        te: "te-IN",
        ta: "ta-IN",
        mr: "mr-IN",
        gu: "gu-IN",
        kn: "kn-IN",
        pa: "pa-IN",
        ml: "ml-IN",
      };
      recognitionInstance.lang = langMap[language] || "en-IN";

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsRecording(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language]);

  // 🔹 Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Send text message
  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  // 🔹 Enter key send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 🔹 Handle voice input (speech-to-text)
  const handleVoiceInput = () => {
    if (!recognition) {
      alert(
        "Voice recognition not supported in your browser. Please use Chrome, Edge, or Safari."
      );
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsRecording(false);
      }
    }
  };

  // ✅ NEW: Server-side TTS with audio queue
  useEffect(() => {
    if (voiceEnabled && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant" && lastMessage.content) {
        // Add to queue
        setAudioQueue(prev => [...prev, lastMessage.content]);
      }
    }
  }, [messages, voiceEnabled]);

  // ✅ Process audio queue
  useEffect(() => {
    if (audioQueue.length > 0 && !isPlayingAudio) {
      playNextInQueue();
    }
  }, [audioQueue, isPlayingAudio]);

  // ✅ Play audio from server TTS
  async function playNextInQueue() {
    if (audioQueue.length === 0) return;

    const textToSpeak = audioQueue[0];
    setIsPlayingAudio(true);

    try {
      console.log('🔊 Requesting TTS from server...');
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToSpeak,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('TTS API failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.play();

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsPlayingAudio(false);
          setAudioQueue(prev => prev.slice(1)); // Remove played item
        };

        audio.onerror = () => {
          console.error('Audio playback error');
          URL.revokeObjectURL(audioUrl);
          setIsPlayingAudio(false);
          setAudioQueue(prev => prev.slice(1));
        };
      }

    } catch (error) {
      console.error('TTS Error:', error);
      setIsPlayingAudio(false);
      setAudioQueue(prev => prev.slice(1));
    }
  }

  // ✅ Handle audio ended event
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlayingAudio(false);
      setAudioQueue(prev => prev.slice(1));
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 py-4 px-2 sm:px-4">
        <div className="container mx-auto max-w-7xl h-[calc(100vh-2rem)]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-green-800 mb-2">
              AgriBot Assistant
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Get instant help with crop diseases and farming advice
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-3 sm:p-4 mb-4 shadow-sm border border-green-100"
          >
            <div className="flex flex-wrap gap-3 sm:gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <LocationIndicator />

                <div className="flex items-center gap-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Language:
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-xl border border-gray-300 px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="bn">বাংলা</option>
                    <option value="te">తెలుగు</option>
                    <option value="ta">தமிழ்</option>
                    <option value="mr">मराठी</option>
                    <option value="gu">ગુજરાતી</option>
                    <option value="kn">ಕನ್ನಡ</option>
                    <option value="pa">ਪੰਜਾਬੀ</option>
                    <option value="ml">മലയാളം</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>Voice output {isPlayingAudio && '🔊'}</span>
                </label>
              </div>

              <button
                onClick={clearMessages}
                className="text-xs sm:text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
              >
                Clear Chat
              </button>
            </div>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-green-100 flex flex-col"
            style={{ height: "calc(100vh - 240px)" }}
          >
            {/* Messages Area */}
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-lime-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Welcome to AgriBot! 👋
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Ask me anything about crop diseases, farming techniques,
                      weather, or market prices.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() =>
                          sendMessage("What's the weather like today?")
                        }
                        className="px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs sm:text-sm rounded-xl transition-colors"
                      >
                        Weather update
                      </button>
                      <button
                        onClick={() =>
                          sendMessage("Show me current market prices")
                        }
                        className="px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs sm:text-sm rounded-xl transition-colors"
                      >
                        Market prices
                      </button>
                      <button
                        onClick={() =>
                          sendMessage("What crops should I grow this season?")
                        }
                        className="px-3 sm:px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs sm:text-sm rounded-xl transition-colors"
                      >
                        Crop advice
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-5xl mx-auto">
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      message={message}
                      isUser={message.role === "user"}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-3 sm:p-4 bg-gray-50">
              <div className="max-w-5xl mx-auto">
                <div className="flex gap-2 sm:gap-3">
                  {/* Voice Input Button */}
                  <button
                    onClick={handleVoiceInput}
                    className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl transition-all shadow-sm ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                        : "bg-white hover:bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                    title={isRecording ? "Stop recording" : "Start voice input"}
                  >
                    {isRecording ? (
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Message Input */}
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        isRecording
                          ? "Listening..."
                          : "Type your message or use voice input..."
                      }
                      className="w-full h-10 sm:h-12 px-4 py-2 sm:py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm sm:text-base shadow-sm"
                      rows={1}
                      disabled={isRecording}
                    />
                  </div>

                  {/* Send Button */}
                  <button
                    onClick={handleSend}
                    disabled={!inputMessage.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 sm:px-6 rounded-2xl transition-all flex items-center justify-center min-w-[60px] sm:min-w-[80px] shadow-sm hover:shadow-md"
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>

                {/* Voice Indicator */}
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-center text-xs sm:text-sm text-red-600 font-medium"
                  >
                    🎤 Listening... Speak now
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}