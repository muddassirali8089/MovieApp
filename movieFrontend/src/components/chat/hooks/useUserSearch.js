import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export const useUserSearch = (onNewConversation, currentUserId, existingConversations) => {
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
        let allUsers = data.data || []
        
        // Filter out the current user and users already in conversations
        const filteredUsers = allUsers.filter(user => {
          // Don't show current user
          if (user._id === currentUserId) {
            console.log(`🚫 Filtering out current user: ${user.name}`)
            return false
          }
          
          // Don't show users already in conversations
          const existingConversation = existingConversations.find(conv => 
            conv.participants.some(participant => participant._id === user._id)
          )
          
          if (existingConversation) {
            console.log(`🚫 Filtering out user already in conversation: ${user.name}`)
            return false
          }
          
          return true
        })
        
        console.log(`🔍 Search results: ${allUsers.length} total users, ${filteredUsers.length} available users`)
        setUsers(filteredUsers)
      }
    } catch (error) {
      console.error('Error searching users:', error)
      toast.error('Failed to search users')
    } finally {
      setIsLoading(false)
    }
  }

  const createConversation = async (userId) => {
    // Double-check if conversation already exists
    const existingConversation = existingConversations.find(conv => 
      conv.participants.some(participant => participant._id === userId)
    )
    
    if (existingConversation) {
      toast.error('Conversation already exists with this user')
      return
    }
    
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

  return {
    searchQuery,
    setSearchQuery,
    users,
    isLoading,
    isCreating,
    createConversation
  }
}
