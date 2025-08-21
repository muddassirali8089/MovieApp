'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Film, Calendar, Tag } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Image from 'next/image'

export default function MyRatedMovies() {
  const [ratedMovies, setRatedMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchMyRatings()
    }
  }, [user])

  const fetchMyRatings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:7000/api/v1/users/my-ratings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRatedMovies(data.data.ratings)
      } else {
        setError('Failed to fetch ratings')
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <div className="animate-pulse">
          <div className="h-6 bg-dark-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-20 h-28 bg-dark-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                  <div className="h-3 bg-dark-700 rounded w-1/2"></div>
                  <div className="h-3 bg-dark-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 text-center">
        <div className="text-red-400 mb-2">
          <Film className="w-8 h-8 mx-auto" />
        </div>
        <p className="text-white mb-4">{error}</p>
        <button 
          onClick={fetchMyRatings}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (ratedMovies.length === 0) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700 text-center">
        <div className="text-dark-400 mb-4">
          <Star className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Movies Rated Yet</h3>
        <p className="text-dark-300 mb-4">
          Start rating movies to see them here!
        </p>
        <Link href="/movies" className="btn-primary">
          Browse Movies
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-6 h-6 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">My Rated Movies</h2>
        <span className="text-dark-300 text-sm">({ratedMovies.length})</span>
      </div>

      <div className="space-y-4">
        {ratedMovies.map((rating) => (
          <motion.div
            key={rating._id}
            className="flex gap-4 p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-dark-500 transition-colors"
            whileHover={{ scale: 1.01 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Movie Poster */}
            <Link href={`/movie/${rating.movie._id}`} className="flex-shrink-0">
              <div className="w-20 h-28 rounded-lg overflow-hidden bg-dark-600">
                <Image
                  src={rating.movie.posterImage || '/placeholder-movie.jpg'}
                  alt={rating.movie.title}
                  width={80}
                  height={112}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
            </Link>

            {/* Movie Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <Link href={`/movie/${rating.movie._id}`}>
                  <h3 className="text-lg font-semibold text-white hover:text-primary-400 transition-colors truncate">
                    {rating.movie.title}
                  </h3>
                </Link>
                
                {/* Rating Display */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rating.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-dark-500'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-yellow-400 font-semibold text-sm">
                    {rating.rating}/5
                  </span>
                </div>
              </div>

              {/* Movie Details */}
              <div className="flex items-center gap-4 text-sm text-dark-300 mb-2">
                {rating.movie.releaseYear && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{rating.movie.releaseYear}</span>
                  </div>
                )}
                
                {rating.movie.genre && (
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{rating.movie.genre}</span>
                  </div>
                )}
              </div>

              {/* Movie Rating Info */}
              <div className="flex items-center gap-4 text-xs text-dark-400">
                <span>Your Rating: {rating.rating} stars</span>
                {rating.movie.averageRating && (
                  <span>Community Average: {rating.movie.averageRating}/5</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View All Movies Link */}
      <div className="mt-6 text-center">
        <Link href="/movies" className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
          View All Movies →
        </Link>
      </div>
    </div>
  )
}
