import { useState } from 'react'

export const useChatSidebar = (onDeleteConversation) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const handleDeleteClick = (conversationId) => {
    setShowDeleteConfirm(conversationId)
  }

  const confirmDelete = (conversationId) => {
    onDeleteConversation(conversationId)
    setShowDeleteConfirm(null)
  }

  const clearDeleteConfirm = () => {
    setShowDeleteConfirm(null)
  }

  return {
    searchQuery,
    setSearchQuery,
    showDeleteConfirm,
    handleDeleteClick,
    confirmDelete,
    clearDeleteConfirm
  }
}
