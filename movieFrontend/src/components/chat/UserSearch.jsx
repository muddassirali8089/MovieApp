'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, User, X, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UserSearch({ onClose, onNewConversation, currentUserId }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers()
    } else {
      setUsers([])
    }
  }, [searchQuery])

  const searchUsers = async () => {
    if (searchQuery.length < 2) return
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/search-users?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data || [])
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setIsLoading(false)
    }
  }

  const createConversation = async (userId) => {
    setIsCreating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          participantId: userId
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        onNewConversation(data.data)
        toast.success('Conversation created!')
      } else {
        toast.error('Failed to create conversation')
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast.error('Failed to create conversation')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-dark-800 rounded-xl border border-dark-700 w-full max-w-md max-h-[80vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Start New Chat</h2>
            <button
              onClick={onClose}
              className="p-1 text-dark-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-dark-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-dark-400">Searching...</p>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">Type at least 2 characters to search</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-12 h-12 text-dark-600 mx-auto mb-3" />
              <p className="text-dark-400">No users found</p>
              <p className="text-sm text-dark-500">Try a different search term</p>
            </div>
          ) : (
            <div className="p-2">
              {users.map((user) => (
                <motion.div
                  key={user._id}
                  className="flex items-center gap-3 p-3 hover:bg-dark-700 rounded-lg cursor-pointer transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createConversation(user._id)}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{user.name}</h3>
                    <p className="text-sm text-dark-400 truncate">{user.email}</p>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    <motion.button
                      className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-600/20 rounded-lg transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={isCreating}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-dark-700">
          <p className="text-xs text-dark-400 text-center">
            Search for users to start chatting with them
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
