'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Play, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function MovieCard({ movie }) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).getFullYear()
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      )
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />
      )
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-3 h-3 text-gray-400" />
      )
    }

    return stars
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getImageSrc = () => {
    if (imageError || !movie.image || movie.image.includes('via.placeholder.com')) {
      // Base64 placeholder image (simple gray rectangle with play icon)
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9Ijc1MCIgdmlld0JveD0iMCAwIDUwMCA3NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjUwMCIgaGVpZ2h0PSI3NTAiIGZpbGw9IiMxZjI5MzciLz4KICA8cmVjdCB4PSI1MCIgeT0iMTAwIiB3aWR0aD0iNDAwIiBoZWlnaHQ9IjU1MCIgZmlsbD0iIzM3NDE1MSIgcng9IjgiLz4KICA8Y2lyY2xlIGN4PSIyNTAiIGN5PSIzMDAiIHI9IjQwIiBmaWxsPSIjNmI3MjgwIi8KICA8cGF0aCBkPSJNMjQwIDI5MCBMMjYwIDMwMCBMMjQwIDMxMCIgZmlsbD0iIzljYTNhZiIvPgogIDx0ZXh0IHg9IjI1MCIgeT0iNDUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPk1vdmllIFBvc3RlcjwvdGV4dD4KICA8dGV4dCB4PSIyNTAiIHk9IjQ3MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzZjNzI4MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pgo8L3N2Zz4='
    }
    return movie.image
  }

  return (
    <motion.div
      className="group bg-dark-800 rounded-xl overflow-hidden shadow-lg border border-dark-700 hover:border-primary-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      {/* Movie Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={getImageSrc()}
          alt={movie.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
          onError={handleImageError}
        />
        
        {/* Overlay with Play Button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.button
            className="p-3 bg-primary-600 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-6 h-6 text-white fill-white" />
          </motion.button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-primary-600/90 text-white text-xs font-medium rounded-full backdrop-blur-sm">
            {movie.category?.name || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Link href={`/movie/${movie._id}`}>
          <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors duration-200 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap">
            {movie.title}
          </h3>
        </Link>

        {/* Rating and Year */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {renderStars(movie.averageRating || 0)}
            </div>
            <span className="text-sm text-dark-300">
              {movie.averageRating?.toFixed(1) || '0.0'}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-dark-400">
            <Calendar className="w-3 h-3" />
            <span className="text-sm">{formatDate(movie.releaseDate)}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-dark-300 text-sm leading-relaxed overflow-hidden text-ellipsis whitespace-nowrap">
          {movie.description}
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <Link href={`/movie/${movie._id}`} className="block">
            <motion.button
              className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View Details
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
