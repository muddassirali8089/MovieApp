export const getOtherParticipant = (conversation, currentUserId) => {
  if (!conversation?.participants || !Array.isArray(conversation.participants)) {
    return null
  }
  
  const otherParticipant = conversation.participants.find(p => p._id !== currentUserId)
  return otherParticipant || conversation.participants[0] || null
}

export const getLastMessagePreview = (conversation) => {
  if (!conversation.lastMessage || !conversation.lastMessage.content) {
    return 'No messages yet'
  }
  
  const content = conversation.lastMessage.content
  if (typeof content !== 'string') {
    return 'No messages yet'
  }
  
  return content.length > 30 ? `${content.substring(0, 30)}...` : content
}

export const formatLastActivity = (date) => {
  if (!date) return 'Just now'
  
  try {
    const now = new Date()
    const lastActivity = new Date(date)
    
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

export const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export const hasUnreadMessages = (conversation, currentUserId) => {
  return conversation.lastMessage && 
         conversation.lastMessage.senderId && 
         conversation.lastMessage.senderId !== currentUserId &&
         conversation.lastMessage.isRead === false
}

export const filterConversations = (conversations, searchQuery, currentUserId) => {
  if (!searchQuery) return conversations
  
  return conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv, currentUserId)
    if (!otherParticipant) return false
    
    return otherParticipant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           otherParticipant.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })
}
