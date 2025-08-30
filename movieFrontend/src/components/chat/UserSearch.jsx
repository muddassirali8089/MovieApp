'use client'

import { motion } from 'framer-motion'
import { User, X, MessageCircle, Search } from 'lucide-react'
import { SearchBar, Avatar } from './components'
import { useUserSearch } from './hooks/useUserSearch'

export default function UserSearch({ onClose, onNewConversation, currentUserId }) {
  const {
    searchQuery,
    setSearchQuery,
    users,
    isLoading,
    isCreating,
    createConversation
  } = useUserSearch(onNewConversation)

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
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users by name or email..."
            autoFocus
          />
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
                  <Avatar
                    src={user.profileImage}
                    alt={user.name}
                    size="md"
                  />

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
