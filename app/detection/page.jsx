// app/detection/page.jsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import UploadCard from '@/components/upload-card'
import ResultCard from '@/components/result-card'
import { Spinner } from '@/components/ui/spinner'
import ProtectedRoute from '@/components/protected-route'

export default function DetectionPage() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [voiceOutput, setVoiceOutput] = useState(false)

  const handleFilesSelect = (files) => {
    setSelectedFiles(files)
    setResult(null)
  }

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return

    setLoading(true)
    setResult(null)

    try {
      // Convert files to base64 for API
      const filePromises = selectedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      })

      const imageData = await Promise.all(filePromises)

      // TODO: Replace with actual ML API call
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData[0], 
          multipleImages: imageData.length > 1 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)

        // TODO: Implement voice output if enabled
        if (voiceOutput) {
          // speakResults(data)
        }
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReanalyze = () => {
    setResult(null)
    setSelectedFiles([])
  }

  const handleChat = () => {
    // Navigate to chatbot with context
    window.location.href = `/chatbot?disease=${encodeURIComponent(result.disease)}`
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-green-800 mb-4">Disease Detection</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload crop images for instant AI-powered disease analysis and treatment recommendations
            </p>
          </motion.div> */}

          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
              <div className="flex items-center space-x-8 text-sm">
                {['1 Upload Images', '2 AI Analysis', '3 Results & Treatment'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-green-600 text-white' : 
                      index === 1 && loading ? 'bg-amber-500 text-white' :
                      index === 2 && result ? 'bg-green-600 text-white' : 
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="ml-2 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Upload Section */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <UploadCard 
                onFilesSelect={handleFilesSelect} 
                multiple={true}
              />

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Selected Images ({selectedFiles.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-2xl"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <Spinner className="mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      'Analyze Images'
                    )}
                  </button>

                  <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={voiceOutput}
                      onChange={(e) => setVoiceOutput(e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span>Enable voice output</span>
                  </label>
                </div>
              )}
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <ResultCard 
              result={result}
              onReanalyze={handleReanalyze}
              onChat={handleChat}
            />
          )}

          {/* Tips Section */}
          {!result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-12  gap-8"
            >
              {/* Tips for Better Results */}
              <div className="bg-white rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Tips for Better Results</h3>
                <div className="space-y-3">
                  {[
                    { icon: '☀️', title: 'Clear, well-lit photos', desc: 'Take photos in good lighting conditions' },
                    { icon: '🎯', title: 'Focus on affected areas', desc: 'Capture close-ups and keep turn on location' },
                    { icon: '📐', title: 'Multiple angles', desc: 'Upload 2-3 images from different perspectives' }
                  ].map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{tip.title}</p>
                        <p className="text-sm text-gray-600">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Features */}
              {/* <div className="bg-white rounded-2xl p-6 border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-4">AI-Powered Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl">
                    <span className="font-medium text-green-800">Advanced AI Detection</span>
                    <span className="text-sm bg-green-600 text-white px-2 py-1 rounded-full">87%+ accuracy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-2xl">
                    <span className="font-medium text-amber-800">Treatment Recommendations</span>
                    <span className="text-sm bg-amber-500 text-white px-2 py-1 rounded-full">Organic & chemical</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-lime-50 rounded-2xl">
                    <span className="font-medium text-lime-800">50+ Diseases</span>
                    <span className="text-sm bg-lime-500 text-white px-2 py-1 rounded-full">Comprehensive</span>
                  </div>
                </div>
              </div> */}
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}