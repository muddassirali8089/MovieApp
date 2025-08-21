'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MovieRating({ movieId, initialRating = 0, onRatingChange }) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingSubmit = async (newRating) => {
    if (!localStorage.getItem('auth_token')) {
      toast.error('Please login to rate movies')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`http://localhost:7000/api/v1/movies/${movieId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ rating: newRating })
      })

      if (response.ok) {
        setRating(newRating)
        onRatingChange?.(newRating)
        toast.success(`Rated ${newRating} stars!`)
      } else {
        const data = await response.json()
        toast.error(data.message || 'Failed to submit rating')
      }
    } catch (error) {
      console.error('Rating error:', error)
      toast.error('Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    const stars = []
    const displayRating = hoverRating || rating

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <motion.button
          key={i}
          onClick={() => handleRatingSubmit(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={isSubmitting}
          className="p-1 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Star
            className={`w-6 h-6 ${
              i <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-400 hover:text-yellow-300'
            } transition-colors duration-200`}
          />
        </motion.button>
      )
    }
    return stars
  }

  return (
    <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
      <h3 className="text-lg font-semibold text-white mb-4">Rate this movie</h3>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex gap-1">
          {renderStars()}
        </div>
        <span className="text-dark-300 text-sm">
          {hoverRating ? `${hoverRating} stars` : rating ? `${rating} stars` : 'Hover to rate'}
        </span>
      </div>

      {rating > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-primary-400 font-medium">
            You rated this movie {rating} {rating === 1 ? 'star' : 'stars'}
          </p>
          <button
            onClick={() => handleRatingSubmit(0)}
            className="text-sm text-dark-400 hover:text-white transition-colors mt-2"
          >
            Clear rating
          </button>
        </motion.div>
      )}

      {isSubmitting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-primary-400 text-sm mt-2"
        >
          Submitting rating...
        </motion.div>
      )}
    </div>
  )
}
