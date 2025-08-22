'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RecommendationsPreview() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch('http://localhost:7000/api/v1/movies/recommendations?limit=4', {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
        <span className="ml-3 text-white">Loading recommendations...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-dark-400 mb-4">Unable to load recommendations</p>
        <button
          onClick={fetchRecommendations}
          className="btn-secondary text-sm"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="w-12 h-12 text-dark-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Recommendations Yet</h3>
        <p className="text-dark-300 mb-4 text-sm">
          Start rating movies to get personalized recommendations!
        </p>
        <Link href="/movies" className="btn-secondary text-sm">
          Browse Movies
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((movie, index) => (
        <motion.div
          key={movie._id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
        >
          {/* Movie Image */}
          <div className="flex-shrink-0">
            <img
              src={movie.image}
              alt={movie.title}
              className="w-16 h-20 object-cover rounded-lg"
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold truncate">{movie.title}</h3>
            <p className="text-dark-300 text-sm truncate">{movie.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-white text-sm">{movie.averageRating}</span>
              </div>
              <span className="text-dark-400 text-sm">{movie.category}</span>
            </div>
          </div>

          {/* Recommendation Score */}
          {movie.recommendationScore && (
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-600/20 text-primary-400 text-xs rounded-full">
                <Sparkles className="w-3 h-3" />
                {movie.recommendationScore}
              </span>
            </div>
          )}

          {/* View Button */}
          <div className="flex-shrink-0">
            <Link href={`/movie/${movie._id}`}>
              <button className="btn-secondary text-xs px-3 py-1">
                View
              </button>
            </Link>
          </div>
        </motion.div>
      ))}

      {/* View All Link */}
      {recommendations.length > 0 && (
        <div className="text-center pt-4">
          <Link href="/recommendations" className="text-primary-400 hover:text-primary-300 text-sm font-medium">
            View all recommendations →
          </Link>
        </div>
      )}
    </div>
  )
}
