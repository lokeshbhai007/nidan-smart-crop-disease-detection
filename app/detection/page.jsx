// app/detection/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, MapPin, Cloud, Droplets, Wind, ThermometerSun, CheckCircle, AlertCircle } from 'lucide-react'

export default function EnhancedDetectionPage() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [stage, setStage] = useState('upload') // upload, crop-selection, farmer-input, analysis, results
  const [detectedCrops, setDetectedCrops] = useState([])
  const [selectedCrop, setSelectedCrop] = useState(null)
  const [farmerInput, setFarmerInput] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [weatherData, setWeatherData] = useState(null)
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [recognition, setRecognition] = useState(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = 'hi-IN' // Default to Hindi
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setFarmerInput(prev => prev + ' ' + transcript)
      }
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [])

  // Get user location and weather
  const fetchLocationAndWeather = async () => {
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported')
      }

      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords
      setLocation({ latitude, longitude })

      // Fetch weather data (using Open-Meteo API - free, no API key needed)
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&timezone=auto`
      )
      
      const weatherJson = await weatherResponse.json()
      
      setWeatherData({
        temperature: weatherJson.current.temperature_2m,
        humidity: weatherJson.current.relative_humidity_2m,
        precipitation: weatherJson.current.precipitation,
        windSpeed: weatherJson.current.wind_speed_10m,
        weatherCode: weatherJson.current.weather_code,
        location: `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`
      })
    } catch (error) {
      console.error('Location/Weather error:', error)
      setError('Unable to fetch location and weather. Results may be less accurate.')
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    setStage('upload')
    setError(null)
  }

  // Initial crop detection
  const handleInitialAnalysis = async () => {
    if (selectedFiles.length === 0) return

    setLoading(true)
    setError(null)

    // Fetch location and weather
    await fetchLocationAndWeather()

    try {
      const filePromises = selectedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      })

      const imageData = await Promise.all(filePromises)

      const response = await fetch('/api/detect-crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData[0],
          multipleImages: imageData.length > 1
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDetectedCrops(data.crops || [])
        setStage('crop-selection')
      } else {
        throw new Error('Failed to detect crops')
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      setError('Failed to analyze image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle crop selection
  const handleCropSelect = (crop) => {
    setSelectedCrop(crop)
    setStage('farmer-input')
  }

  // Toggle voice recording
  const toggleRecording = () => {
    if (!recognition) {
      alert('Voice recognition not supported in your browser')
      return
    }

    if (isRecording) {
      recognition.stop()
      setIsRecording(false)
    } else {
      recognition.start()
      setIsRecording(true)
    }
  }

  // Final analysis with all data
  const handleFinalAnalysis = async () => {
    if (!selectedCrop || !farmerInput.trim()) {
      setError('Please select a crop and provide symptoms description')
      return
    }

    setLoading(true)
    setStage('analysis')
    setError(null)

    try {
      const filePromises = selectedFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target.result)
          reader.readAsDataURL(file)
        })
      })

      const imageData = await Promise.all(filePromises)

      const response = await fetch('/api/detect-comprehensive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageData[0],
          selectedCrop: selectedCrop,
          farmerInput: farmerInput,
          weatherData: weatherData,
          location: location,
          userId: 'demo-user' // Replace with actual user ID
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setStage('results')
      } else {
        throw new Error('Failed to analyze disease')
      }
    } catch (error) {
      console.error('Final analysis failed:', error)
      setError('Analysis failed. Please try again.')
      setStage('farmer-input')
    } finally {
      setLoading(false)
    }
  }

  // Reset everything
  const handleReset = () => {
    setSelectedFiles([])
    setStage('upload')
    setDetectedCrops([])
    setSelectedCrop(null)
    setFarmerInput('')
    setWeatherData(null)
    setLocation(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-green-100">
            <div className="flex items-center space-x-4 text-xs sm:text-sm">
              {['Upload', 'Select Crop', 'Describe', 'Analyze', 'Results'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    stage === 'upload' && index === 0 ? 'bg-green-600 text-white' :
                    stage === 'crop-selection' && index === 1 ? 'bg-green-600 text-white' :
                    stage === 'farmer-input' && index === 2 ? 'bg-green-600 text-white' :
                    stage === 'analysis' && index === 3 ? 'bg-amber-500 text-white' :
                    stage === 'results' && index === 4 ? 'bg-green-600 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 4 && <div className="w-8 h-0.5 bg-gray-300 mx-1" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Stage */}
        {stage === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-green-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Crop Images</h2>
            <p className="text-gray-600 mb-6">Take clear photos of affected leaves or plants</p>
            
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-green-300 rounded-2xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-12 h-12 mb-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="mb-2 text-sm text-gray-700"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
            </label>

            {selectedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Images ({selectedFiles.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {selectedFiles.map((file, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl border-2 border-green-200"
                    />
                  ))}
                </div>
                <button
                  onClick={handleInitialAnalysis}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Detect Crop Type'}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Crop Selection Stage */}
        {stage === 'crop-selection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-green-100"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your Crop</h2>
            <p className="text-gray-600 mb-6">Choose the correct crop type from our top matches</p>
            
            <div className="space-y-4">
              {detectedCrops.map((crop, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCropSelect(crop)}
                  className="w-full p-6 bg-gradient-to-r from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌾</span>
                        <h3 className="text-xl font-bold text-gray-900">{crop.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">AI Confidence: {crop.confidence}%</p>
                    </div>
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      #{index + 1}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Farmer Input Stage */}
        {stage === 'farmer-input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Selected Crop */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌾</span>
                  <div>
                    <p className="text-sm text-gray-600">Selected Crop</p>
                    <h3 className="text-xl font-bold text-gray-900">{selectedCrop?.name}</h3>
                  </div>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Weather Data */}
            {weatherData && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Current Weather Conditions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-gray-600">Temperature</p>
                      <p className="font-bold text-gray-900">{weatherData.temperature}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-600">Humidity</p>
                      <p className="font-bold text-gray-900">{weatherData.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Rainfall</p>
                      <p className="font-bold text-gray-900">{weatherData.precipitation}mm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="text-xs text-gray-600">Wind Speed</p>
                      <p className="font-bold text-gray-900">{weatherData.windSpeed}km/h</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Farmer Input */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Describe the Problem</h3>
              <p className="text-sm text-gray-600 mb-4">Tell us what symptoms you're seeing (use voice or text)</p>
              
              <div className="relative">
                <textarea
                  value={farmerInput}
                  onChange={(e) => setFarmerInput(e.target.value)}
                  placeholder="पत्तियों पर पीले धब्बे हैं, फसल सूख रही है..."
                  className="w-full p-4 pr-20 border-2 border-gray-300 rounded-2xl focus:border-green-500 focus:outline-none min-h-32 resize-none"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={toggleRecording}
                    className={`p-3 rounded-full transition-colors ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                        : 'bg-green-100 hover:bg-green-200 text-green-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-800">
                  💡 <strong>Tip:</strong> Describe color changes, spots, wilting, holes, or any unusual growth patterns you see
                </p>
              </div>

              <button
                onClick={handleFinalAnalysis}
                disabled={!farmerInput.trim() || loading}
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Get Comprehensive Analysis
              </button>
            </div>
          </motion.div>
        )}

        {/* Analysis Stage */}
        {stage === 'analysis' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 shadow-lg border border-green-100 text-center"
          >
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analyzing Your Crop</h2>
            <p className="text-gray-600 mb-2">Processing image analysis...</p>
            <p className="text-gray-600 mb-2">Evaluating farmer observations...</p>
            <p className="text-gray-600 mb-2">Correlating weather conditions...</p>
            <p className="text-gray-600">Generating comprehensive diagnosis...</p>
          </motion.div>
        )}

        {/* Results Stage */}
        {stage === 'results' && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-green-600 to-lime-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">Comprehensive Analysis Complete</h2>
              <p className="text-green-50">AI + Farmer Input + Weather Data</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Accuracy Score */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 rounded-2xl border-2 border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">Diagnosis Accuracy</h3>
                  <span className="text-3xl font-bold text-green-600">{result.accuracy}%</span>
                </div>
                <p className="text-sm text-gray-600">Based on image analysis, farmer observations, and weather patterns</p>
              </div>

              {/* Disease Detection */}
              <div className="p-6 bg-red-50 rounded-2xl border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-800 mb-2">{result.disease}</h3>
                <p className="text-sm text-gray-700 mb-3">{result.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-red-200 text-red-800 rounded-full text-xs font-medium">
                    {result.severity}
                  </span>
                  <span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-xs font-medium">
                    Confidence: {result.confidence}%
                  </span>
                </div>
              </div>

              {/* Contributing Factors */}
              {result.contributingFactors && (
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-200">
                  <h3 className="font-bold text-gray-900 mb-3">Weather & Environmental Factors</h3>
                  <ul className="space-y-2">
                    {result.contributingFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 mt-1">•</span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Treatment Recommendations */}
              <div className="p-6 bg-green-50 rounded-2xl border border-green-200">
                <h3 className="font-bold text-gray-900 mb-4">Recommended Treatments</h3>
                <div className="space-y-3">
                  {result.treatments?.map((treatment, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-green-300">
                      <h4 className="font-semibold text-green-800 mb-2">{treatment.name}</h4>
                      <p className="text-sm text-gray-600">{treatment.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors"
                >
                  New Analysis
                </button>
                <button
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Ask Expert
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}