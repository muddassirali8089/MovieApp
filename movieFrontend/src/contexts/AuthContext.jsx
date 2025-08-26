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
        // Handle both possible response structures
        const userData = data.data?.user || data.user || data
        
        if (userData && userData._id) {
          setUser({
            _id: userData._id,
            name: userData.name || 'User',
            email: userData.email || 'user@example.com',
            address: userData.address,
            dateOfBirth: userData.dateOfBirth,
            profileImage: userData.profileImage,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          })
          console.log('User state updated successfully from profile fetch')
        } else {
          console.error('Invalid profile data structure:', data)
          setUser(null)
        }
      } else {
        console.log('Profile fetch failed, removing token')
        // If token is invalid, remove it
        localStorage.removeItem('token')
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // If there's an error, remove the token
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
      console.log('Profile fetch completed, loading set to false')
    }
  }

  const login = (token, userData) => {
    console.log('Login called with token and user data:', token ? 'Token exists' : 'No token')
    
    // Store token in localStorage
    localStorage.setItem('token', token)
    console.log('Token stored in localStorage')
    
    // Set user data immediately from login response
    if (userData) {
      setUser({
        _id: userData._id,
        name: userData.name || 'User',
        email: userData.email || 'user@example.com',
        profileImage: userData.profileImage,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      })
      console.log('User state updated from login response')
    }
    
    // Also fetch fresh profile data to ensure consistency
    fetchUserProfile(token)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const refreshUserProfile = () => {
    const token = localStorage.getItem('token')
    if (token) {
      fetchUserProfile(token)
    } else {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token')
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
