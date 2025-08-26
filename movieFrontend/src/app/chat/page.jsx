'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Search, 
  Send, 
  MoreVertical, 
  ArrowLeft,
  User,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'
import ChatSidebar from '@/components/chat/ChatSidebar'
import ChatWindow from '@/components/chat/ChatWindow'
import UserSearch from '@/components/chat/UserSearch'

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    
    fetchConversations()
    fetchUnreadCount()
  }, [user, router])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setConversations(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.data?.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleNewConversation = (conversation) => {
    setConversations(prev => [conversation, ...prev])
    setSelectedConversation(conversation)
    setShowUserSearch(false)
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    // Mark conversation as read
    markConversationAsRead(conversation._id)
  }

  const markConversationAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      // Update unread count
      fetchUnreadCount()
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  const handleMessageSent = (message) => {
    // Update conversation last message
    setConversations(prev => 
      prev.map(conv => 
        conv._id === selectedConversation._id 
          ? { ...conv, lastMessage: message, lastActivity: new Date() }
          : conv
      )
    )
  }

  const handleDeleteConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv._id !== conversationId))
        if (selectedConversation?._id === conversationId) {
          setSelectedConversation(null)
        }
        toast.success('Conversation deleted')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
      toast.error('Failed to delete conversation')
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => router.back()}
              className="p-2 text-white hover:text-primary-400 hover:bg-dark-700 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-white">Chat</h1>
            </div>
          </div>
          
          <motion.button
            onClick={() => setShowUserSearch(true)}
            className="btn-primary flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <User className="w-4 h-4" />
            New Chat
          </motion.button>
        </div>

        {/* Chat Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ChatSidebar
              conversations={conversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              onDeleteConversation={handleDeleteConversation}
              isLoading={isLoading}
              unreadCount={unreadCount}
              currentUser={user}
            />
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <ChatWindow
                conversation={selectedConversation}
                currentUser={user}
                onMessageSent={handleMessageSent}
                onMarkAsRead={() => markConversationAsRead(selectedConversation._id)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-dark-800 rounded-xl border border-dark-700">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
                  <p className="text-dark-400">Choose a conversation from the sidebar to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Search Modal */}
      <AnimatePresence>
        {showUserSearch && (
          <UserSearch
            onClose={() => setShowUserSearch(false)}
            onNewConversation={handleNewConversation}
            currentUserId={user._id}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
