// app/chatbot/page.jsx
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
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const {
    messages,
    language,
    voiceEnabled,
    setLanguage,
    setVoiceEnabled,
    sendMessage,
    clearMessages,
  } = useChat();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      sendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        sendMessage(
          "I uploaded an image of my crop. Can you help me identify any issues?",
          e.target.result
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input using Web Speech API
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      console.log("Voice recording started - implement Web Speech API");
    } else {
      // Stop recording
      console.log("Voice recording stopped");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              AgriBot Assistant
            </h1>
            <p className="text-lg text-gray-600">
              Get instant help with crop diseases and farming advice
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-green-100"
          >
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <LocationIndicator />

                <div>
                  <label className="text-sm font-medium text-gray-700 mr-2">
                    Language:
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="rounded-2xl border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>

                <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={voiceEnabled}
                    onChange={(e) => setVoiceEnabled(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span>Voice output</span>
                </label>
              </div>

              <button
                onClick={clearMessages}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm border border-green-100 h-[500px] flex flex-col"
          >
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-green-600"
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
                    <p className="text-lg font-medium text-gray-900">
                      Welcome to AgriBot!
                    </p>
                    <p className="text-gray-600 mt-2">
                      Ask me anything about crop diseases or upload images for
                      analysis.
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    isUser={message.role === "user"}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                {/* Image Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors"
                  title="Upload image"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Voice Input Button */}
                <button
                  onClick={handleVoiceInput}
                  className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-colors ${
                    isRecording
                      ? "bg-red-100 hover:bg-red-200 text-red-600"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                  }`}
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  <svg
                    className="w-5 h-5"
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
                </button>

                {/* Message Input */}
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message... (Press Enter to send)"
                    className="w-full h-10 max-h-32 px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    rows={1}
                  />
                </div>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={!inputMessage.trim()}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 rounded-2xl transition-colors flex items-center justify-center min-w-[60px]"
                >
                  <svg
                    className="w-5 h-5"
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
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
