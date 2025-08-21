'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

export default function MovieRating({ movieId, initialRating = 0, onRatingChange }) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      checkUserRating()
    }, 100) // Small delay to prevent flickering
    
    return () => clearTimeout(timer)
  }, [movieId, user])

  const checkUserRating = async () => {
    try {
      if (!user) {
        setLoading(false)
        setHasRated(false)
        return
      }

      // Get token from localStorage for API call
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        setHasRated(false)
        return
      }

      const response = await fetch(`http://localhost:7000/api/v1/movies/${movieId}/my-rating`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('API response for user rating:', data)
        console.log('Response structure:', {
          hasData: !!data.data,
          dataType: typeof data.data,
          ratingPath: data.data?.rating,
          ratingType: typeof data.data?.rating,
          fullData: data
        })
        
        // Check different possible response structures
        let ratingValue = null
        if (data.data && data.data.rating !== undefined) {
          // If rating is directly a number (like in your case: data.data.rating = 1)
          if (typeof data.data.rating === 'number') {
            ratingValue = data.data.rating
          } else if (data.data.rating && typeof data.data.rating.rating === 'number') {
            // If rating is an object with nested rating property
            ratingValue = data.data.rating.rating
          }
        } else if (data.rating !== undefined) {
          ratingValue = data.rating
        }
        
        if (ratingValue !== null && ratingValue > 0) {
          setHasRated(true)
          setUserRating(ratingValue)
          setRating(ratingValue)
          console.log('User has rated:', ratingValue)
        } else {
          setHasRated(false)
          setUserRating(0)
          setRating(0)
          console.log('User has not rated')
        }
      } else {
        setHasRated(false)
        setUserRating(0)
        setRating(0)
      }
    } catch (error) {
      console.error('Error checking user rating:', error)
      setHasRated(false)
      setUserRating(0)
      setRating(0)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingSubmit = async (newRating) => {
    if (!user) {
      toast.error('Please login to rate movies')
      return
    }

    if (hasRated) {
      toast.error('You have already rated this movie')
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
        // Update all rating states immediately
        setRating(newRating)
        setUserRating(newRating)
        setHasRated(true)
        setHoverRating(0) // Reset hover state
        
        console.log('Rating submitted successfully:', {
          newRating,
          hasRated: true,
          userRating: newRating
        })
        
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
          disabled={isSubmitting || hasRated}
          className="p-1 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: hasRated ? 1 : 1.1 }}
          whileTap={{ scale: hasRated ? 1 : 0.9 }}
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

  if (loading) {
    return (
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <div className="animate-pulse">
          <div className="h-6 bg-dark-700 rounded mb-4"></div>
          <div className="h-8 bg-dark-700 rounded mb-4"></div>
          <div className="h-4 bg-dark-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (hasRated) {
    console.log('Rendering already rated section:', { hasRated, userRating, rating })
    
    return (
      <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-4">
            You rated this movie ⭐ {userRating} {userRating === 1 ? 'star' : 'stars'}
          </h3>
          
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  userRating >= i + 1 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    )
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
            You selected {rating} {rating === 1 ? 'star' : 'stars'}
          </p>
          <button
            onClick={() => handleRatingSubmit(rating)}
            disabled={isSubmitting}
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
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
