// components/chat-bubble.jsx
'use client'

import { motion } from 'framer-motion'

export default function ChatBubble({ message, isUser = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-xs md:max-w-md rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-green-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        {message.image && (
          <img 
            src={message.image} 
            alt="Uploaded preview" 
            className="rounded-lg mb-2 max-w-full h-auto"
          />
        )}
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <div className={`text-xs mt-2 ${isUser ? 'text-green-100' : 'text-gray-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}