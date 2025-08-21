'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Star, Calendar, Clock, Play, Heart, Share2 } from 'lucide-react'
import MovieRating from '@/components/MovieRating'
import toast from 'react-hot-toast'

export default function MovieDetailPage() {
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    fetchMovie()
  }, [params.id])

  const fetchMovie = async () => {
    try {
      const response = await fetch(`http://localhost:7000/api/v1/movies/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMovie(data.data.movie)
      } else {
        toast.error('Movie not found')
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching movie:', error)
      toast.error('Failed to load movie')
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = (newRating) => {
    // Update the movie's average rating in the UI
    if (movie) {
      setMovie(prev => ({
        ...prev,
        averageRating: newRating
      }))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-5 h-5 fill-yellow-400/50 text-yellow-400" />
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-400" />
      )
    }

    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading movie...</p>
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Movie not found</h1>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-dark-300 hover:text-white transition-colors mb-6"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>
      </div>

      {/* Movie Hero Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={movie.image || '/placeholder-movie.jpg'}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <motion.button
                  className="p-4 bg-primary-600 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-8 h-8 text-white fill-white" />
                </motion.button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <motion.button
                onClick={() => setIsLiked(!isLiked)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-dark-700 text-white hover:bg-dark-600 border border-dark-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className={`w-5 h-5 inline mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </motion.button>
              
              <motion.button
                className="p-3 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Movie Info */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Title and Rating */}
            <div className="mb-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                {movie.title}
              </h1>
              
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {renderStars(movie.averageRating || 0)}
                  </div>
                  <span className="text-white font-medium">
                    {movie.averageRating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-dark-300">
                    ({movie.ratings?.length || 0} ratings)
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-dark-300">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(movie.releaseDate)}</span>
                </div>
              </div>

              {/* Category Badge */}
              <div className="inline-block px-4 py-2 bg-primary-600/20 border border-primary-600/30 rounded-full text-primary-400 font-medium">
                {movie.category?.name || 'Unknown Category'}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-3">Synopsis</h2>
              <p className="text-dark-200 leading-relaxed text-lg">
                {movie.description}
              </p>
            </div>

            {/* Movie Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-dark-700">
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {movie.averageRating?.toFixed(1) || '0.0'}
                </div>
                <div className="text-dark-300 text-sm">Average Rating</div>
              </div>
              
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-dark-700">
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {movie.ratings?.length || 0}
                </div>
                <div className="text-dark-300 text-sm">Total Ratings</div>
              </div>
              
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-dark-700">
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {new Date(movie.releaseDate).getFullYear()}
                </div>
                <div className="text-dark-300 text-sm">Release Year</div>
              </div>
              
              <div className="bg-dark-800 rounded-xl p-4 text-center border border-dark-700">
                <div className="text-2xl font-bold text-primary-400 mb-1">
                  {movie.category?.name || 'N/A'}
                </div>
                <div className="text-dark-300 text-sm">Genre</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Rating Section */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MovieRating 
            movieId={movie._id} 
            onRatingChange={handleRatingChange}
          />
        </motion.div>
      </div>
    </div>
  )
}
