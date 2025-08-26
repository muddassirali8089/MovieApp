'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSocket } from '@/contexts/SocketContext'
import './chat.css'

export default function ChatWindow({ conversation, currentUser, onMessageSent, onMarkAsRead }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { joinConversation, leaveConversation, startTyping, stopTyping, isConnected } = useSocket()

  const otherParticipant = conversation.participants.find(p => p._id !== currentUser._id)

  useEffect(() => {
    fetchMessages()
    onMarkAsRead()
    
    // Simple conversation tracking
    if (conversation._id) {
      joinConversation(conversation._id)
    }

    // Cleanup
    return () => {
      if (conversation._id) {
        leaveConversation(conversation._id)
      }
    }
  }, [conversation._id, joinConversation, leaveConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages.length])

  // Real-time event listeners
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { conversationId, message } = event.detail
      console.log('New message received:', { conversationId, messageConversationId: message.conversationId, conversationId: conversation._id })
      
      // Check if this message belongs to the current conversation
      if (conversationId === conversation._id || message.conversationId === conversation._id) {
        console.log('Adding message to current conversation')
        setMessages(prev => [...prev, message])
        onMessageSent(message)
      }
    }

    const handleUserTyping = (event) => {
      const { conversationId, userId, userName, isTyping } = event.detail
      if (conversationId === conversation._id && userId !== currentUser._id) {
        if (isTyping) {
          setTypingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, userName }])
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== userId))
        }
      }
    }

    const handleMessageRead = (event) => {
      const { conversationId, messageId, readBy } = event.detail
      if (conversationId === conversation._id) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        )
      }
    }

    // Add event listeners
    window.addEventListener('new_message', handleNewMessage)
    window.addEventListener('user_typing', handleUserTyping)
    window.addEventListener('message_read', handleMessageRead)

    // Cleanup
    return () => {
      window.removeEventListener('new_message', handleNewMessage)
      window.removeEventListener('user_typing', handleUserTyping)
      window.removeEventListener('message_read', handleMessageRead)
    }
  }, [conversation._id, currentUser._id, onMessageSent])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversation._id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    
    // Stop typing indicator
    stopTyping(conversation._id)
    setIsTyping(false)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: 'text'
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        const message = data.data
        console.log('Message sent successfully:', message)
        setMessages(prev => [...prev, message])
        onMessageSent(message)
        setNewMessage('')
        inputRef.current?.focus()
      } else {
        toast.error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      })
    }
  }

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isLoading) {
    return (
      <div className="bg-dark-800 rounded-xl border border-dark-700 h-full flex flex-col">
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-12 bg-dark-700 rounded-lg"></div>
          <div className="space-y-3 flex-1">
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
      {/* Header - Fixed */}
      <div className="p-4 border-b border-dark-700 flex-shrink-0">
        {/* Connection Status */}
        <div className="mb-2 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex items-center gap-3">
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
          <div>
            <h3 className="font-semibold text-white">{otherParticipant.name}</h3>
            <p className="text-sm text-dark-400">{otherParticipant.email}</p>
          </div>
        </div>
      </div>

      {/* Messages Container - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages bg-gradient-to-b from-dark-800 to-dark-900" style={{ height: '0' }}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-dark-400">No messages yet</p>
            <p className="text-sm text-dark-500">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === currentUser._id;
            
            return (
              <motion.div
                key={message._id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg message-bubble ${
                  isOwnMessage 
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md' 
                    : 'bg-gradient-to-br from-dark-700 to-dark-600 text-white rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className={`flex items-center justify-between mt-2 ${
                    isOwnMessage ? 'text-primary-200' : 'text-dark-400'
                  }`}>
                    <span className="text-xs">
                      {formatMessageTime(message.createdAt)}
                    </span>
                    {message.isRead && isOwnMessage && (
                      <span className="text-xs ml-2">✓✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator - Fixed */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-2 border-t border-dark-700 bg-dark-800/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
            </div>
            <span className="text-sm text-dark-400">
              {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        </div>
      )}

      {/* Message Input - Fixed */}
      <div className="p-4 border-t border-dark-700 flex-shrink-0">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value)
              // Handle typing indicators
              if (e.target.value && !isTyping) {
                setIsTyping(true)
                startTyping(conversation._id)
              } else if (!e.target.value && isTyping) {
                setIsTyping(false)
                stopTyping(conversation._id)
              }
            }}
            onFocus={() => {
              if (newMessage && !isTyping) {
                setIsTyping(true)
                startTyping(conversation._id)
              }
            }}
            onBlur={() => {
              if (isTyping) {
                setIsTyping(false)
                stopTyping(conversation._id)
              }
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            disabled={isSending}
          />
          <motion.button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </div>
  )
}
