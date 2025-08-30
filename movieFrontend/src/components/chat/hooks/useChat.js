import { useState, useEffect, useRef } from 'react'
import { useSocket } from '@/contexts/SocketContext'
import toast from 'react-hot-toast'

export const useChat = (conversation, currentUser, onMessageSent, onMarkAsRead) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const { joinConversation, leaveConversation, startTyping, stopTyping, isConnected } = useSocket()

  const otherParticipant = conversation?.participants?.find(p => p._id !== currentUser?._id)

  // Mark conversation as read immediately when it opens
  useEffect(() => {
    if (conversation?._id) {
      fetchMessages()
      // Mark as read immediately when conversation opens
      markConversationAsRead()
      joinConversation(conversation._id)
    }

    return () => {
      if (conversation?._id) {
        leaveConversation(conversation._id)
      }
    }
  }, [conversation?._id, joinConversation, leaveConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark conversation as read when messages are loaded
  useEffect(() => {
    if (conversation?._id && messages.length > 0) {
      markConversationAsRead()
    }
  }, [conversation?._id, messages.length])

  useEffect(() => {
    const handleNewMessage = (event) => {
      const { conversationId, message } = event.detail
      
      if (conversationId === conversation?._id || message.conversationId === conversation._id) {
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === message._id)
          if (messageExists) return prev
          return [...prev, message]
        })
        
        // Call onMessageSent to update conversation order in sidebar
        onMessageSent(message)
        
        // If this is a new message from someone else, mark it as read immediately
        if (message.senderId !== currentUser?._id) {
          markMessageAsRead(message._id)
        }
      }
    }

    const handleUserTyping = (event) => {
      const { conversationId, userId, userName, isTyping } = event.detail
      if (conversationId === conversation?._id && userId !== currentUser?._id) {
        if (isTyping) {
          setTypingUsers(prev => [...prev.filter(u => u.userId !== userId), { userId, userName }])
        } else {
          setTypingUsers(prev => prev.filter(u => u.userId !== userId))
        }
      }
    }

    const handleMessageRead = (event) => {
      const { conversationId, messageId } = event.detail
      if (conversationId === conversation?._id) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        )
      }
    }

    window.addEventListener('new_message', handleNewMessage)
    window.addEventListener('user_typing', handleUserTyping)
    window.addEventListener('message_read', handleMessageRead)

    return () => {
      window.removeEventListener('new_message', handleNewMessage)
      window.removeEventListener('user_typing', handleUserTyping)
      window.removeEventListener('message_read', handleMessageRead)
    }
  }, [conversation?._id, currentUser?._id, onMessageSent])

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

  // Mark conversation as read - this is the key function
  const markConversationAsRead = async () => {
    if (!conversation?._id) return
    
    try {
      const token = localStorage.getItem('token')
      
      console.log('🔄 Marking conversation as read:', conversation._id)
      
      // Call the backend to mark conversation as read
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/conversations/${conversation._id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        // Call onMarkAsRead to update the parent component (this removes the unread dot)
        onMarkAsRead()
        
        // Update local messages to mark them as read
        setMessages(prev => 
          prev.map(msg => ({
            ...msg,
            isRead: true
          }))
        )
        
        console.log('✅ Conversation marked as read:', conversation._id)
      } else {
        console.error('❌ Failed to mark conversation as read:', response.status)
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
      }
    } catch (error) {
      console.error('❌ Error marking conversation as read:', error)
    }
  }

  // Mark individual message as read
  const markMessageAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000/api/v1'}/chat/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        // Update local message state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        )
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
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
        
        // Call onMessageSent to update conversation order in sidebar
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

  const handleTyping = (value) => {
    setNewMessage(value)
    if (value && !isTyping) {
      setIsTyping(true)
      startTyping(conversation._id)
    } else if (!value && isTyping) {
      setIsTyping(false)
      stopTyping(conversation._id)
    }
  }

  const handleInputFocus = () => {
    if (newMessage && !isTyping) {
      setIsTyping(true)
      startTyping(conversation._id)
    }
  }

  const handleInputBlur = () => {
    if (isTyping) {
      setIsTyping(false)
      stopTyping(conversation._id)
    }
  }

  return {
    messages,
    newMessage,
    isLoading,
    isSending,
    isTyping,
    typingUsers,
    isConnected,
    otherParticipant,
    messagesEndRef,
    inputRef,
    sendMessage,
    handleTyping,
    handleInputFocus,
    handleInputBlur,
    scrollToBottom,
    markConversationAsRead,
    markMessageAsRead
  }
}
