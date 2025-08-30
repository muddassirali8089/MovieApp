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
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUserSearch, setShowUserSearch] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Wait for authentication to complete before checking user
    if (loading) {
      return
    }
    
    if (!user) {
      router.push('/login')
      return
    }
    
    fetchConversations()
    fetchUnreadCount()
  }, [user, loading, router])

  // Real-time event listener for new messages and conversation updates
  useEffect(() => {
    console.log('🔧 Setting up real-time event listeners...')
    
    const handleNewMessageEvent = (event) => {
      const { conversationId, message } = event.detail
      console.log('📨 New message event received:', { conversationId, message })
      
      // Check if this conversation already exists in the user's list
      const existingConversation = conversations.find(conv => conv._id === conversationId)
      
      if (!existingConversation) {
        console.log('🆕 New conversation detected from message, fetching conversation details...')
        // This is a new conversation, fetch it and add to list
        fetchAndAddNewConversation(conversationId);
      } else {
        console.log('🔄 Updating existing conversation with new message')
        // Update conversation with new message
        setConversations(prev => 
          prev.map(conv => 
            conv._id === conversationId
              ? { ...conv, lastMessage: message, lastActivity: new Date() }
              : conv
          )
        )
      }
      
      // Update unread count if message is from someone else
      if (message.senderId !== user._id) {
        console.log('🔄 Updating unread count for new message from other user')
        fetchUnreadCount()
      }
    }

    const handleConversationUpdatedEvent = (event) => {
      const { conversationId, conversation } = event.detail
      console.log('🔄 Conversation updated event received:', { conversationId, conversation })
      console.log('📋 Current conversations list:', conversations)
      console.log('👤 Current user:', user._id)

      const existingConversation = conversations.find(conv => conv._id === conversationId)
      console.log('🔍 Existing conversation found:', existingConversation)

      if (!existingConversation) {
        console.log('➕ Adding new conversation to list:', conversation)
        setConversations(prev => {
          const newList = [conversation, ...prev]
          console.log('📝 Updated conversations list:', newList)
          return newList
        })
        
        if (!selectedConversation) {
          console.log('🎯 Setting as selected conversation')
          setSelectedConversation(conversation)
        }
        
        console.log('🔢 Fetching unread count for new conversation')
        fetchUnreadCount() // Update unread count since this is a new conversation
      } else {
        console.log('🔄 Updating existing conversation:', conversationId)
        setConversations(prev => {
          const updatedList = prev.map(conv =>
            conv._id === conversationId ? conversation : conv
          )
          console.log('📝 Updated conversations list:', updatedList)
          return updatedList
        })
        
        if (selectedConversation?._id === conversationId) {
          console.log('🎯 Updating selected conversation')
          setSelectedConversation(conversation)
        }
      }
    }

    // Add event listeners
    console.log('🎧 Adding event listeners for new_message and conversation_updated')
    window.addEventListener('new_message', handleNewMessageEvent)
    window.addEventListener('conversation_updated', handleConversationUpdatedEvent)

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up event listeners')
      window.removeEventListener('new_message', handleNewMessageEvent)
      window.removeEventListener('conversation_updated', handleConversationUpdatedEvent)
    }
  }, [conversations, selectedConversation, user])

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

  const handleNewConversation = async (conversation) => {
    console.log('🆕 New conversation created:', conversation);
    
    // Fetch the full conversation with populated user data
    const populatedConversation = await fetchConversationWithUsers(conversation._id);
    
    if (populatedConversation) {
      setConversations(prev => [populatedConversation, ...prev]);
      setSelectedConversation(populatedConversation);
    } else {
      // Fallback: add the conversation as is
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation);
    }
    
    setShowUserSearch(false);
  }

  // Helper function to fetch conversation with populated user data
  const fetchConversationWithUsers = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Fetched populated conversation:', data.data);
        return data.data;
      }
    } catch (error) {
      console.error('❌ Error fetching conversation with users:', error);
    }
    return null;
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    // Mark conversation as read
    markConversationAsRead(conversation._id)
  }

  const markConversationAsRead = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔄 Marking conversation as read from chat page:', conversationId)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        console.log('✅ Conversation marked as read from chat page')
        // Update unread count
        fetchUnreadCount()
        
        // Update conversations list to reflect read status
        setConversations(prev => 
          prev.map(conv => 
            conv._id === conversationId
              ? { ...conv, lastMessage: { ...conv.lastMessage, isRead: true } }
              : conv
          )
        )
      } else {
        console.error('❌ Failed to mark conversation as read from chat page:', response.status)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
      }
    } catch (error) {
      console.error('❌ Error marking conversation as read from chat page:', error)
    }
  }

  const handleMessageSent = (message) => {
    // Check if this conversation already exists in the list
    const existingConversation = conversations.find(conv => conv._id === message.conversationId);
    
    if (existingConversation) {
      // Update existing conversation
      setConversations(prev => 
        prev.map(conv => 
          conv._id === message.conversationId
            ? { ...conv, lastMessage: message, lastActivity: new Date() }
            : conv
        )
      )
    } else {
      // This is a new conversation, we need to fetch it and add it to the list
      fetchAndAddNewConversation(message.conversationId);
    }
  }

  const fetchAndAddNewConversation = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        const newConversation = data.data
        
        // Add the new conversation to the list
        setConversations(prev => [newConversation, ...prev])
        
        // If no conversation is currently selected, select this new one
        if (!selectedConversation) {
          setSelectedConversation(newConversation)
        }
      }
    } catch (error) {
      console.error('Error fetching new conversation:', error)
    }
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

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if no user after loading is complete
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
