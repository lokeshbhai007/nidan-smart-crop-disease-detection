"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Star, ExternalLink, TrendingUp, Package } from 'lucide-react'

export default function MedicineRecommendationModal({ isOpen, onClose, result }) {
  const [sortBy, setSortBy] = useState('rating') // 'rating' or 'price'
  
  if (!isOpen || !result) return null

  // Extract all medicines from treatments
  const allMedicines = []
  result.treatments?.forEach(treatment => {
    if (treatment.products && treatment.products.length > 0) {
      treatment.products.forEach(product => {
        allMedicines.push({
          ...product,
          treatmentName: treatment.name,
          priority: treatment.priority,
          effectiveness: treatment.effectiveness
        })
      })
    }
  })

  // Sort medicines
  const sortedMedicines = [...allMedicines].sort((a, b) => {
    if (sortBy === 'rating') {
      return parseFloat(b.rating) - parseFloat(a.rating)
    } else {
      return b.price - a.price // Descending order (highest first)
    }
  })

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-2 pr-12">Expert Medicine Recommendations</h2>
            <p className="text-green-50">For: {result.disease}</p>
            <div className="mt-3 flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span className="font-semibold">{sortedMedicines.length} Products Available</span>
            </div>
          </div>

          {/* Sort Options */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600 font-medium">Sort by:</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('rating')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                  sortBy === 'rating'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Star className="w-4 h-4 inline mr-1" />
                Highest Rating
              </button>
              <button
                onClick={() => setSortBy('price')}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                  sortBy === 'price'
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Highest Price
              </button>
            </div>
          </div>

          {/* Products List */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
            <div className="space-y-4">
              {sortedMedicines.map((medicine, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-lg transition-all"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={medicine.image}
                        alt={medicine.name}
                        className="w-28 h-28 object-cover rounded-xl border-2 border-gray-200"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
                            {medicine.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            For: <span className="font-semibold text-green-700">{medicine.treatmentName}</span>
                          </p>
                        </div>
                        
                        {/* Priority Badge */}
                        {medicine.priority && (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            medicine.priority === 'High' ? 'bg-red-100 text-red-700' :
                            medicine.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {medicine.priority} Priority
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-gray-900">{medicine.rating}</span>
                          <span className="text-sm text-gray-500">/5</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-1">
                          <span className="text-2xl font-bold text-green-600">
                            ₹{medicine.price}
                          </span>
                        </div>

                        {/* Stock Status */}
                        {medicine.inStock ? (
                          <span className="text-sm text-green-600 font-medium">✓ In Stock</span>
                        ) : (
                          <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                        )}
                      </div>

                      {/* Seller & Effectiveness */}
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">
                          Seller: <span className="font-medium">{medicine.seller}</span>
                        </p>
                        {medicine.effectiveness && (
                          <span className="text-sm font-semibold text-blue-600">
                            {medicine.effectiveness} Effective
                          </span>
                        )}
                      </div>

                      {/* Buy Button */}
                      <a
                        href={medicine.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                          medicine.inStock
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        onClick={(e) => !medicine.inStock && e.preventDefault()}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        {medicine.inStock ? 'Buy Now' : 'Out of Stock'}
                        {medicine.inStock && <ExternalLink className="w-4 h-4" />}
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {sortedMedicines.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No products available</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-blue-50 border-t border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              💡 <strong>Tip:</strong> Consult with an agricultural expert before purchasing. Prices and availability may vary.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}