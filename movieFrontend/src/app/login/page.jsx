'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, Film, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { handleRateLimit, handleLoginAttempts } from '@/utils/rateLimitHandler'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)
  const router = useRouter()
  const { login, user, isAuthenticated } = useAuth()

  // If user is already logged in, show only the redirect message
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">
            You're Already Logged In! 🎬
          </h1>
          <p className="text-dark-300 text-lg mb-6">
            You're already logged in! Just watch the movies and enjoy!
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/')}
              className="w-full bg-primary-500 text-white py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Go Watch Movies
            </button>
            <button 
              onClick={() => router.push('/profile')}
              className="w-full bg-dark-700 text-white py-3 px-6 rounded-lg hover:bg-dark-600 transition-colors"
            >
              My Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Check if user is blocked
    if (isBlocked) {
      toast.error('Account is temporarily blocked. Please try again after 1 hour.')
      return
    }
    
    setLoading(true)

    try {
      const response = await fetch('http://localhost:7000/api/v1/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      // Handle rate limiting first
      if (handleRateLimit(response, 'Login failed. Please try again.')) {
        setLoading(false)
        setIsBlocked(true)
        return
      }

      if (response.ok) {
        const data = await response.json()
        // Reset attempts on successful login
        setLoginAttempts(0)
        setIsBlocked(false)
        // Use the login function from AuthContext
        login(data.token)
        toast.success('Login successful! Welcome back!')
        router.push('/')
      } else {
        // Handle failed login attempts
        const attemptInfo = handleLoginAttempts(response, loginAttempts + 1)
        const newAttemptCount = loginAttempts + 1
        
        if (attemptInfo.isRateLimited) {
          setIsBlocked(true)
          setLoginAttempts(5)
        } else {
          setLoginAttempts(newAttemptCount)
          if (newAttemptCount >= 5) {
            setIsBlocked(true)
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const getAttemptMessage = () => {
    if (isBlocked) {
      return 'Account temporarily blocked. Please try again after 1 hour.'
    }
    if (loginAttempts > 0) {
      const remaining = 5 - loginAttempts
      return `Invalid credentials. You have ${remaining} attempts left.`
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Film className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-dark-300">Sign in to your MovieZone account</p>
        </motion.div>

        {/* Attempt Warning */}
        {(loginAttempts > 0 || isBlocked) && (
          <motion.div
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-red-400 font-medium">Login Attempt Warning</p>
                <p className="text-sm text-red-300">{getAttemptMessage()}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Login Form */}
        <motion.div
          className="bg-dark-800 rounded-2xl p-8 shadow-2xl border border-dark-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isBlocked}
                  className="w-full pl-10 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isBlocked}
                  className="w-full pl-10 pr-12 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBlocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading || isBlocked}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: (loading || isBlocked) ? 1 : 1.02 }}
              whileTap={{ scale: (loading || isBlocked) ? 1 : 0.98 }}
            >
              {loading ? 'Signing In...' : isBlocked ? 'Account Blocked' : 'Sign In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-dark-600" />
            <span className="px-4 text-sm text-dark-400">or</span>
            <div className="flex-1 border-t border-dark-600" />
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button 
              disabled={isBlocked}
              className="w-full py-3 px-4 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 bg-blue-600 rounded-full" />
              Continue with Google
            </button>
            <button 
              disabled={isBlocked}
              className="w-full py-3 px-4 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-xl text-white font-medium transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full" />
              Continue with Facebook
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-dark-300">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          className="text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/" className="text-dark-400 hover:text-white transition-colors">
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
