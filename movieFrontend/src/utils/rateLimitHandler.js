import toast from 'react-hot-toast'

/**
 * Handle rate limiting errors from the backend
 * @param {Response} response - The fetch response object
 * @param {string} fallbackMessage - Fallback error message
 * @returns {boolean} - True if rate limited, false otherwise
 */
export const handleRateLimit = (response, fallbackMessage = 'Request failed') => {
  if (response.status === 429) {
    // Rate limited
    try {
      response.json().then(data => {
        const message = data.message || 'Too many requests. Please try again later.'
        
        // Check if it's a login rate limit
        if (message.toLowerCase().includes('login')) {
          toast.error('Too many login attempts! Please try again after 1 hour.')
        } else {
          toast.error(message)
        }
      })
    } catch (error) {
      toast.error('Too many requests. Please try again later.')
    }
    return true
  }
  
  return false
}

/**
 * Handle login attempts and show appropriate messages
 * @param {Response} response - The fetch response object
 * @param {number} attemptCount - Current attempt count
 * @returns {Object} - Object with isRateLimited and remainingAttempts
 */
export const handleLoginAttempts = (response, attemptCount) => {
  if (response.status === 429) {
    // Rate limited - all attempts used
    toast.error('Too many login attempts! Please try again after 1 hour.')
    return { isRateLimited: true, remainingAttempts: 0 }
  }
  
  if (response.status === 401) {
    // Unauthorized - wrong credentials
    const remainingAttempts = 5 - attemptCount
    if (remainingAttempts > 0) {
      toast.error(`Invalid credentials. You have ${remainingAttempts} attempts left.`)
    } else {
      toast.error('Account locked due to too many failed attempts. Please try again after 1 hour.')
    }
    return { isRateLimited: false, remainingAttempts }
  }
  
  return { isRateLimited: false, remainingAttempts: 5 }
} 