'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, Film, Search, ArrowLeft, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  const handleGoBack = () => {
    router.back()
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        {/* 404 Icon */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <motion.div
              className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <Film className="w-16 h-16 text-white" />
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-red-600 font-bold text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                4
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-red-600 font-bold text-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                4
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-4">
            Oops!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-red-400 mb-4">
            Page Not Found
          </h2>
          <p className="text-dark-300 text-lg leading-relaxed">
            The page you're looking for seems to have wandered off into the movie universe. 
            Don't worry, we'll help you get back on track!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/">
            <motion.button
              className="btn-primary flex items-center gap-2 px-6 py-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-5 h-5" />
              Go Home
            </motion.button>
          </Link>

          <motion.button
            onClick={handleGoBack}
            className="btn-secondary flex items-center gap-2 px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </motion.button>

          <motion.button
            onClick={handleRefresh}
            className="btn-secondary flex items-center gap-2 px-6 py-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </motion.button>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          className="bg-dark-800 rounded-2xl p-6 border border-dark-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/movies">
              <motion.button
                className="w-full p-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors flex items-center gap-2 justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Film className="w-4 h-4" />
                Browse Movies
              </motion.button>
            </Link>
            
            <Link href="/categories">
              <motion.button
                className="w-full p-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors flex items-center gap-2 justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Search className="w-4 h-4" />
                Categories
              </motion.button>
            </Link>
            
            <Link href="/login">
              <motion.button
                className="w-full p-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-lg text-white transition-colors flex items-center gap-2 justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-4 h-4" />
                Login
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <p className="text-dark-400 text-sm">
            If you believe this is an error, please contact our support team.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
