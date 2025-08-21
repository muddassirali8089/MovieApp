'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  const [isFocused, setIsFocused] = useState(false)

  const handleClear = () => {
    onChange('')
  }

  return (
    <motion.div 
      className="relative w-full max-w-md"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-400">
          <Search className="w-5 h-5" />
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />

        {/* Clear Button */}
        {value && (
          <motion.button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-dark-400 hover:text-white transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4" />
          </motion.button>
        )}

        {/* Focus Ring */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-xl ring-2 ring-primary-500/20"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* Search Suggestions (Optional) */}
      {isFocused && value && (
        <motion.div
          className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="p-3 text-sm text-dark-300 border-b border-dark-600">
            Quick suggestions
          </div>
          <div className="p-2">
            <div className="px-3 py-2 hover:bg-dark-700 rounded-lg cursor-pointer text-sm">
              Search for "{value}" in titles
            </div>
            <div className="px-3 py-2 hover:bg-dark-700 rounded-lg cursor-pointer text-sm">
              Search for "{value}" in descriptions
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
