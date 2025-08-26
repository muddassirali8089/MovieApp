'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext()

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
      return
    }

    // Create socket connection
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000'}/chat`, {
      auth: {
        token: localStorage.getItem('token')
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
    })

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id)
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsConnected(false)
    })

    // Chat events
    newSocket.on('connected', (data) => {
      console.log('Connected to chat server:', data)
    })

    newSocket.on('joined_conversation', (data) => {
      console.log('Joined conversation:', data)
    })

    newSocket.on('left_conversation', (data) => {
      console.log('Left conversation:', data)
    })

    newSocket.on('new_message', (data) => {
      console.log('New message received in socket:', data)
      // You can emit a custom event here to notify components
      window.dispatchEvent(new CustomEvent('new_message', { detail: data }))
    })

    newSocket.on('conversation_updated', (data) => {
      console.log('Conversation updated:', data)
      window.dispatchEvent(new CustomEvent('conversation_updated', { detail: data }))
    })

    newSocket.on('new_conversation', (data) => {
      console.log('New conversation created:', data)
      window.dispatchEvent(new CustomEvent('new_conversation', { detail: data }))
    })

    newSocket.on('message_read', (data) => {
      console.log('Message read:', data)
      window.dispatchEvent(new CustomEvent('message_read', { detail: data }))
    })

    newSocket.on('user_typing', (data) => {
      console.log('User typing:', data)
      window.dispatchEvent(new CustomEvent('user_typing', { detail: data }))
    })

    newSocket.on('error', (data) => {
      console.error('Socket error:', data)
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, user])

  const joinConversation = (conversationId) => {
    // No room joining needed - simplified implementation
    console.log('Joined conversation:', conversationId)
  }

  const leaveConversation = (conversationId) => {
    // No room leaving needed - simplified implementation
    console.log('Left conversation:', conversationId)
  }

  const startTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId })
    }
  }

  const stopTyping = (conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId })
    }
  }

  const value = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
