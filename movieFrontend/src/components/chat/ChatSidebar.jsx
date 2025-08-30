'use client'

import { AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { 
  SearchBar, 
  ConversationItem, 
  DeleteConfirmation, 
  LoadingSkeleton 
} from './components'
import { filterConversations } from './utils/chatUtils'
import { useChatSidebar } from './hooks/useChatSidebar'

export default function ChatSidebar({
  conversations,
  selectedConversation,
  onConversationSelect,
  onDeleteConversation,
  isLoading,
  unreadCount,
  currentUser
}) {
  const {
    searchQuery,
    setSearchQuery,
    showDeleteConfirm,
    handleDeleteClick,
    confirmDelete,
    clearDeleteConfirm
  } = useChatSidebar(onDeleteConversation)

  const filteredConversations = filterConversations(conversations, searchQuery, currentUser?._id)

  if (isLoading) {
    return <LoadingSkeleton type="conversation" />
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white mb-3">Conversations</h2>
        
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search conversations..."
        />
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
              const isSelected = selectedConversation?._id === conversation._id
              
              return (
                <div key={conversation._id} className="relative">
                  <ConversationItem
                    conversation={conversation}
                    currentUserId={currentUser?._id}
                    isSelected={isSelected}
                    onSelect={onConversationSelect}
                    onDelete={handleDeleteClick}
                  />
                  
                  <AnimatePresence>
                    {showDeleteConfirm === conversation._id && (
                      <DeleteConfirmation
                        isVisible={true}
                        onConfirm={() => confirmDelete(conversation._id)}
                        onCancel={clearDeleteConfirm}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
