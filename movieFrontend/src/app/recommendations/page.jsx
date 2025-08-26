'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, Star, Calendar, Tag, Loader2, AlertCircle } from 'lucide-react'
import MovieCard from '@/components/MovieCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [limit, setLimit] = useState(10)
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for authentication to finish loading before checking
    if (authLoading) {
      console.log('Auth still loading...')
      return
    }
    
    console.log('Auth loaded, checking authentication:', { isAuthenticated, user })
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    console.log('Authenticated, fetching recommendations')
    fetchRecommendations()
  }, [isAuthenticated, authLoading, limit])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`http://localhost:7000/api/v1/movies/recommendations?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const data = await response.json()
      setRecommendations(data.data.recommendations || [])
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchRecommendations()
  }

  // Don't render anything while authentication is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <LoadingSkeleton className="h-8 w-64 mx-auto mb-4" />
            <LoadingSkeleton className="h-4 w-96 mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <LoadingSkeleton className="h-8 w-64 mx-auto mb-4" />
            <LoadingSkeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold gradient-text">Your Recommendations</h1>
          </div>
          <p className="text-dark-300 text-lg max-w-2xl mx-auto">
            Discover movies tailored just for you based on your ratings and preferences
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <label className="text-white text-sm">Show:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="bg-dark-800 border border-dark-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={5}>5 movies</option>
              <option value={10}>10 movies</option>
              <option value={15}>15 movies</option>
              <option value={20}>20 movies</option>
            </select>
          </div>
          
          <motion.button
            onClick={handleRefresh}
            className="btn-secondary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-4 h-4" />
            Refresh Recommendations
          </motion.button>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-900/20 border border-red-600/30 rounded-xl p-6 text-center mb-8"
          >
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 text-lg font-semibold mb-2">Oops! Something went wrong</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="btn-secondary"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="text-dark-300 text-center">
                Found <span className="text-primary-400 font-semibold">{recommendations.length}</span> movies for you
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {recommendations.map((movie, index) => (
                <motion.div
                  key={movie._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MovieCard movie={movie} />
                  {movie.recommendationScore && (
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded-full">
                        <Star className="w-3 h-3" />
                        Score: {movie.recommendationScore}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Sparkles className="w-16 h-16 text-dark-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Recommendations Yet</h3>
            <p className="text-dark-300 mb-6 max-w-md mx-auto">
              Start rating movies to get personalized recommendations! The more you rate, the better we can suggest movies you'll love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/movies')}
                className="btn-primary"
              >
                Browse Movies
              </button>
              <button
                onClick={() => router.push('/my-ratings')}
                className="btn-secondary"
              >
                View My Ratings
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            <span className="ml-3 text-white">Finding the perfect movies for you...</span>
          </div>
        )}
      </div>
    </div>
  )
}
