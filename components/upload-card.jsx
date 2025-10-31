// components/upload-card.jsx
'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'

export default function UploadCard({ onFilesSelect, multiple = false }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    
    if (files.length > 0) {
      onFilesSelect(multiple ? files : [files[0]])
    }
  }, [onFilesSelect, multiple])

  const handleFileInput = useCallback((e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      onFilesSelect(multiple ? files : [files[0]])
    }
  }, [onFilesSelect, multiple])

  return (
    <motion.div
      className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
        isDragging 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-300 hover:border-green-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Upload Crop Images
        </h3>
        
        <p className="text-gray-600 mb-4">
          Drag and drop your crop images here, or click to browse. Supports JPG, PNG, WebP up to 10MB each.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        
        <label
          htmlFor="file-upload"
          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-medium cursor-pointer transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Browse Files
        </label>

        <div className="mt-4 text-sm text-gray-500">
          <p>JPG, PNG, WebP • Max 10MB per image</p>
          {multiple && <p className="mt-1">Batch processing supported</p>}
        </div>
      </div>
    </motion.div>
  )
}