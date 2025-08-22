'use client'

import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (token) => {
    console.log('Fetching user profile with token:', token ? 'Token exists' : 'No token')
    try {
      const response = await fetch('http://localhost:7000/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      

      if (response.ok) {
        const data = await response.json()
        console.log('Profile data received:', data)
        if (data.data && data.data.user) {
          setUser({
            name: data.data.user.name || 'User',
            email: data.data.user.email || 'user@example.com',
            address: data.data.user.address,
            dateOfBirth: data.data.user.dateOfBirth,
            profileImage: data.data.user.profileImage
          })
          console.log('User state updated')
        }
      } else {
        console.log('Profile fetch failed, removing token')
        // If token is invalid, remove it
        localStorage.removeItem('auth_token')
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // If there's an error, remove the token
      localStorage.removeItem('auth_token')
      setUser(null)
    } finally {
      setLoading(false)
      console.log('Profile fetch completed, loading set to false')
    }
  }

  const login = (token) => {
    console.log('Login called with token:', token ? 'Token exists' : 'No token')
    localStorage.setItem('auth_token', token)
    console.log('Token stored in localStorage')
    fetchUserProfile(token)
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  const refreshUserProfile = () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      fetchUserProfile(token)
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('auth_token')
    if (token) {
      fetchUserProfile(token)
    } else {
      setLoading(false)
    }
  }, [])

  // Debug logging
  useEffect(() => {
    console.log('AuthContext state:', { user, loading, isAuthenticated: !!user })
  }, [user, loading])

  const value = {
    user,
    loading,
    login,
    logout,
    refreshUserProfile,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
