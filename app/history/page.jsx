// app/history/page.jsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ProtectedRoute from '@/components/protected-route'

// Mock history data - replace with actual data from backend
const mockHistory = [
  {
    id: '1',
    image: '/api/placeholder/150/150',
    disease: 'Tomato Blight',
    confidence: 0.87,
    date: '2024-01-15T10:30:00Z',
    remedies: ['Remove infected leaves', 'Apply fungicide']
  },
  {
    id: '2',
    image: '/api/placeholder/150/150',
    disease: 'Powdery Mildew',
    confidence: 0.92,
    date: '2024-01-14T14:20:00Z',
    remedies: ['Apply neem oil', 'Improve air circulation']
  },
  {
    id: '3',
    image: '/api/placeholder/150/150',
    disease: 'Leaf Spot',
    confidence: 0.78,
    date: '2024-01-13T09:15:00Z',
    remedies: ['Remove affected leaves', 'Water at base']
  }
]

export default function HistoryPage() {
  const [history] = useState(mockHistory)

  const handleReanalyze = async (item) => {
    // TODO: Implement reanalysis functionality
    console.log('Reanalyzing:', item)
    // This would call the detection API again with the original image
  }

  const handleChat = (item) => {
    // Navigate to chatbot with historical context
    window.location.href = `/chatbot?disease=${encodeURIComponent(item.disease)}&history=${item.id}`
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-green-800 mb-4">Detection History</h1>
            <p className="text-xl text-gray-600">Review your past crop disease analyses and results</p>
          </motion.div>

          {/* History Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  <img
                    src={item.image}
                    alt={item.disease}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-green-600 text-white text-sm px-2 py-1 rounded-full">
                    {(item.confidence * 100).toFixed(0)}%
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-green-800 mb-2">{item.disease}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>

                  {/* Remedies Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recommended Remedies:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {item.remedies.slice(0, 2).map((remedy, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {remedy}
                        </li>
                      ))}
                      {item.remedies.length > 2 && (
                        <li className="text-green-600 font-medium">
                          +{item.remedies.length - 2} more
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReanalyze(item)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-2xl text-sm font-medium transition-colors"
                    >
                      Re-analyze
                    </button>
                    <button
                      onClick={() => handleChat(item)}
                      className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 py-2 px-3 rounded-2xl text-sm font-medium transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {history.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No detection history yet</h3>
              <p className="text-gray-600 mb-6">Start by uploading images for disease detection</p>
              <a
                href="/detection"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-medium transition-colors"
              >
                Start Detection
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}