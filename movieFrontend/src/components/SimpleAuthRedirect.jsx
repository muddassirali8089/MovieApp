'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SimpleAuthRedirect({ pageType = 'login' }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is not authenticated, redirect to the intended page
    if (!user) {
      if (pageType === 'login') {
        router.push('/login')
      } else if (pageType === 'signup') {
        router.push('/signup')
      }
      return
    }
  }, [user, pageType, router])

  // Don't render anything if user is not authenticated
  if (!user) {
    return null
  }

  const isLoginPage = pageType === 'login'
  const message = isLoginPage 
    ? "You're already logged in! Just watch the movies and enjoy!"
    : "You already have an account! Just login and watch the movies!"

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-4">
          You're Already Logged In! 🎬
        </h1>
        <p className="text-dark-300 text-lg mb-6">
          {message}
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
