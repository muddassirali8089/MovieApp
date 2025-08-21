'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import MyRatedMovies from '@/components/MyRatedMovies'

export default function MyRatingsPage() {
  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Star className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">My Movie Ratings</h1>
          <p className="text-dark-300 text-lg">
            Track all the movies you've rated and see how your taste compares to the community
          </p>
        </motion.div>

        {/* Rated Movies Component */}
        <MyRatedMovies />
      </div>
    </div>
  )
}
