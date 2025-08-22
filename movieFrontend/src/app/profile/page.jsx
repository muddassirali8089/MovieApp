'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Sparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import MyRatedMovies from '@/components/MyRatedMovies'
import RecommendationsPreview from '@/components/RecommendationsPreview'
import Link from 'next/link'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    dateOfBirth: ''
  })
  const [profileImage, setProfileImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null)
  const router = useRouter()
  const { user, refreshUserProfile } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    // Set form data from user context
    setFormData({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
    })
    setLoading(false)
  }, [user, router])

  // Cleanup object URL when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    setFormData({
      name: user.name || '',
      email: user.email || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
    })
    // Clear image preview and reset profile image
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
      setImagePreviewUrl(null)
    }
    setProfileImage(null)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Validate date of birth is not in the future
      if (formData.dateOfBirth) {
        const selectedDate = new Date(formData.dateOfBirth)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
        
        if (selectedDate > today) {
          toast.error('Date of birth cannot be in the future!')
          setSaving(false)
          return
        }
      }

      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('address', formData.address)
      
      // Only append dateOfBirth if it's not empty
      if (formData.dateOfBirth && formData.dateOfBirth.trim() !== '') {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth)
      }
      
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage)
      }

      // Debug: Log what we're sending
      console.log('Sending profile update:', {
        name: formData.name,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        hasImage: !!profileImage,
        imageName: profileImage?.name
      })

      const response = await fetch('http://localhost:7000/api/v1/users/updateProfile', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Profile update successful:', data)
        
        // Clear the profileImage state and preview URL immediately
        if (imagePreviewUrl) {
          URL.revokeObjectURL(imagePreviewUrl)
          setImagePreviewUrl(null)
        }
        setProfileImage(null)
        
        // Update user in context
        await refreshUserProfile()
        
        toast.success('Profile updated successfully!')
        setIsEditing(false)
      } else {
        const errorData = await response.json()
        console.error('Profile update failed:', errorData)
        toast.error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Cleanup previous preview URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
      
      setProfileImage(file)
      // Create new preview URL
      const newPreviewUrl = URL.createObjectURL(file)
      setImagePreviewUrl(newPreviewUrl)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Profile not found</h1>
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
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="container mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          className="bg-dark-800 rounded-2xl p-8 mb-8 border border-dark-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-dark-700 border-4 border-dark-600">
                <Image
                  src={imagePreviewUrl || (user.profileImage || '/placeholder-avatar.jpg')}
                  alt={user.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
              
              {/* Show preview indicator */}
              {profileImage && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                  Preview
                </div>
              )}
            </div>
            
            {/* Show selected image filename */}
            {profileImage && (
              <div className="text-center mt-2">
                <p className="text-xs text-primary-400 font-medium">
                  Selected: {profileImage.name}
                </p>
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {user.name}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-dark-300">
                  <Mail className="w-5 h-5" />
                  <span>{user.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-dark-300">
                  <MapPin className="w-5 h-5" />
                  <span>{user.address || 'Address not set'}</span>
                </div>
                
                <div className="flex items-center gap-3 text-dark-300">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(user.dateOfBirth)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center lg:justify-start">
                {!isEditing ? (
                  <motion.button
                    onClick={handleEdit}
                    className="btn-primary flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <>
                    <motion.button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                      whileHover={{ scale: saving ? 1 : 1.05 }}
                      whileTap={{ scale: saving ? 1 : 0.95 }}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                    
                    <motion.button
                      onClick={handleCancel}
                      className="btn-secondary flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </motion.button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Form */}
        {isEditing && (
          <motion.div
            className="bg-dark-800 rounded-2xl p-8 border border-dark-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile Information</h2>
            
            {/* Image Selection Info */}
            {profileImage && (
              <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Camera className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-primary-400 font-medium">New Profile Image Selected</p>
                    <p className="text-sm text-primary-300">{profileImage.name}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-dark-400 cursor-not-allowed"
                  placeholder="Email cannot be changed"
                />
                <p className="text-xs text-dark-400 mt-1">Email address cannot be modified</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-xs text-dark-400 mt-1">Date cannot be in the future</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* My Rated Movies */}
        <motion.div 
          id="ratings"
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MyRatedMovies />
        </motion.div>

        {/* Recommendations Section */}
        <motion.div 
          id="recommendations"
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Your Recommendations</h2>
                  <p className="text-dark-300">Movies tailored just for you</p>
                </div>
              </div>
              <Link href="/recommendations" className="btn-primary">
                View All
              </Link>
            </div>
            
            <RecommendationsPreview />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
