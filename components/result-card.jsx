// components/result-card.jsx
'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function ResultCard({ result, onReanalyze, onChat }) {
  if (!result) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-green-200">
        <CardHeader className="bg-green-50 rounded-t-2xl">
          <CardTitle className="text-green-800 flex items-center justify-between">
            <span>Detection Results</span>
            <span className="text-sm font-normal bg-green-600 text-white px-3 py-1 rounded-full">
              {(result.confidence * 100).toFixed(1)}% Confidence
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Disease Identified</h4>
              <p className="text-2xl font-bold text-green-700 mb-2">{result.disease}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${result.confidence * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Recommended Remedies</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {result.remedies.map((remedy, index) => (
                    <li key={index}>{remedy}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Prevention Tips</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  {result.prevention.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onReanalyze}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-2xl font-medium transition-colors"
            >
              Re-analyze
            </button>
            <button
              onClick={onChat}
              className="flex-1 border border-green-600 text-green-600 hover:bg-green-50 py-2 px-4 rounded-2xl font-medium transition-colors"
            >
              Chat with AgriBot
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}