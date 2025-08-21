'use client'

import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'

export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }) {
  const allCategories = [
    { _id: 'all', name: 'All Categories' },
    ...(categories || [])
  ]

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-dark-300">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Filter:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {allCategories.map((category, index) => (
          <motion.button
            key={category._id}
            onClick={() => onCategoryChange(category.name === 'All Categories' ? 'all' : category.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              (selectedCategory === 'all' && category.name === 'All Categories') ||
              selectedCategory === category.name
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white border border-dark-600'
            }`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.name}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
