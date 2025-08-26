'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  MoreVertical, 
  Trash2, 
  Search,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function ChatSidebar({
  conversations,
  selectedConversation,
  onConversationSelect,
  onDeleteConversation,
  isLoading,
  unreadCount,
  currentUser
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    
    const otherParticipant = conv.participants.find(p => p._id !== selectedConversation?.participants?.[0]?._id)
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants || !Array.isArray(conversation.participants)) {
      return null
    }
    
    // Find the participant that is not the current user
    const otherParticipant = conversation.participants.find(p => p._id !== currentUser?._id)
    return otherParticipant || conversation.participants[0] || null
  }

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage || !conversation.lastMessage.content) {
      return 'No messages yet'
    }
    
    const content = conversation.lastMessage.content
    if (typeof content !== 'string') {
      return 'No messages yet'
    }
    
    return content.length > 30 ? `${content.substring(0, 30)}...` : content
  }

  const formatLastActivity = (date) => {
    if (!date) return 'Just now'
    
    try {
      const now = new Date()
      const lastActivity = new Date(date)
      
      // Check if date is valid
      if (isNaN(lastActivity.getTime())) {
        return 'Just now'
      }
      
      const diffInHours = Math.floor((now - lastActivity) / (1000 * 60 * 60))
      
      if (diffInHours < 1) return 'Just now'
      if (diffInHours < 24) return `${diffInHours}h ago`
      if (diffInHours < 48) return 'Yesterday'
      return lastActivity.toLocaleDateString()
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Just now'
    }
  }

  const handleDeleteClick = (conversationId) => {
    setShowDeleteConfirm(conversationId)
  }

  const confirmDelete = (conversationId) => {
    onDeleteConversation(conversationId)
    setShowDeleteConfirm(null)
  }

  if (isLoading) {
    return (
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-700 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-dark-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white mb-3">Conversations</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-dark-600 mx-auto mb-3" />
            <p className="text-dark-400">No conversations yet</p>
            <p className="text-sm text-dark-500">Start a new chat to begin messaging</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              
              // Skip rendering if no valid participant found
              if (!otherParticipant) {
                return null
              }
              
              const isSelected = selectedConversation?._id === conversation._id
              const hasUnread = conversation.lastMessage && 
                                conversation.lastMessage.senderId && 
                                conversation.lastMessage.senderId !== currentUser?._id &&
                                conversation.lastMessage.isRead === false

              return (
                <motion.div
                  key={conversation._id}
                  className={`relative group cursor-pointer rounded-lg transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary-600/20 border border-primary-500/30' 
                      : 'hover:bg-dark-700 border border-transparent'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="p-3"
                    onClick={() => onConversationSelect(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        {otherParticipant.profileImage ? (
                          <img
                            src={otherParticipant.profileImage}
                            alt={otherParticipant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-dark-800"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-white truncate">
                            {otherParticipant.name}
                          </h3>
                          <span className="text-xs text-dark-400">
                            {formatLastActivity(conversation.lastActivity)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          hasUnread ? 'text-white font-medium' : 'text-dark-400'
                        }`}>
                          {getLastMessagePreview(conversation)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(conversation._id)
                          }}
                          className="p-1 text-dark-400 hover:text-red-400 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  <AnimatePresence>
                    {showDeleteConfirm === conversation._id && (
                      <motion.div
                        className="absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded-lg p-3 z-10"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <p className="text-sm text-white mb-3">Delete this conversation?</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmDelete(conversation._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1 bg-dark-600 text-white text-sm rounded hover:bg-dark-500 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
