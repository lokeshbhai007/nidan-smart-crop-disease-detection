// components/result-card.jsx

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle, RefreshCcw, MessageCircle, ExternalLink } from 'lucide-react'

export default function ResultCard({ result, onReanalyze, onChat }) {
  if (!result) return null

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'mild':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-lime-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
            <p className="text-green-50">AI-powered disease detection results</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onReanalyze}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl transition-colors"
              title="New Analysis"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Detected Crops */}
        {result.crops && result.crops.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-green-600 mr-2">🌱</span>
              Detected Crops
            </h3>
            <div className="space-y-2">
              {result.crops.map((crop, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100"
                >
                  <span className="font-medium text-green-800">
                    {index + 1}. {crop.name}
                  </span>
                  <span className="text-sm bg-green-600 text-white px-3 py-1 rounded-full font-medium">
                    {crop.confidence}% match
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disease Detection */}
        <div className={`p-4 rounded-xl border ${getSeverityColor(result.severity)}`}>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-bold text-lg">{result.disease || 'Unknown Disease'}</h3>
            </div>
            {result.severity && (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white shadow-sm">
                {result.severity}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className={`font-semibold ${getConfidenceColor(result.confidence)}`}>
              Confidence: {result.confidence}%
            </span>
            {result.timestamp && (
              <span className="text-gray-600">
                {new Date(result.timestamp).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Causes */}
        {result.causes && result.causes.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-amber-600 mr-2">⚠️</span>
              Possible Causes
            </h3>
            <ul className="space-y-2">
              {result.causes.map((cause, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-amber-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700 text-sm">{cause}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Treatments */}
        {result.treatments && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-blue-600 mr-2">💊</span>
              Recommended Treatments
            </h3>

            {/* Organic Treatments */}
            {result.treatments.organic && result.treatments.organic.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                  <span className="mr-2">🌿</span>
                  Organic Solutions
                </h4>
                <div className="space-y-3">
                  {result.treatments.organic.map((treatment, idx) => (
                    <div key={idx} className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <h5 className="font-medium text-green-800 mb-1">{treatment.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>

                      {/* Products */}
                      {treatment.products && treatment.products.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Available Products (Price: High to Low):
                          </p>
                          {treatment.products.map((product, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200 hover:shadow-md transition-shadow"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ⭐ {product.rating} • {product.seller}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-lg font-bold text-green-600">
                                  ₹{product.price.toLocaleString()}
                                </p>
                                <a
                                  href={product.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-end"
                                >
                                  Buy Now <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chemical Treatments */}
            {result.treatments.chemical && result.treatments.chemical.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                  <span className="mr-2">🧪</span>
                  Chemical Solutions
                </h4>
                <div className="space-y-3">
                  {result.treatments.chemical.map((treatment, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <h5 className="font-medium text-blue-800 mb-1">{treatment.name}</h5>
                      <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>

                      {/* Products */}
                      {treatment.products && treatment.products.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-gray-700 mb-2">
                            Available Products (Price: High to Low):
                          </p>
                          {treatment.products.map((product, pIdx) => (
                            <div
                              key={pIdx}
                              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow"
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {product.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                  ⭐ {product.rating} • {product.seller}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-lg font-bold text-blue-600">
                                  ₹{product.price.toLocaleString()}
                                </p>
                                <a
                                  href={product.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 justify-end"
                                >
                                  Buy Now <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fallback for old remedies format */}
        {result.remedies && result.remedies.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Recommended Remedies</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {result.remedies.map((remedy, index) => (
                <li key={index}>{remedy}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Prevention */}
        {result.prevention && result.prevention.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              Prevention Tips
            </h3>
            <ul className="space-y-2">
              {result.prevention.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onReanalyze}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            New Analysis
          </button>
          {onChat && (
            <button
              onClick={onChat}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Ask Expert
            </button>
          )}
        </div>

        {/* Language Info */}
        {result.language && (
          <div className="text-center text-xs text-gray-500 pt-2">
            Results provided in {result.language}
          </div>
        )}
      </div>
    </motion.div>
  )
}