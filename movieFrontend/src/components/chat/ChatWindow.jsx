'use client'

import { useChat } from './hooks/useChat'
import { 
  ChatHeader, 
  Message, 
  MessageInput, 
  TypingIndicator, 
  LoadingSkeleton 
} from './components'
import './chat.css'

export default function ChatWindow({ conversation, currentUser, onMessageSent, onMarkAsRead }) {
  const {
    messages,
    newMessage,
    isLoading,
    isSending,
    typingUsers,
    isConnected,
    otherParticipant,
    messagesEndRef,
    sendMessage,
    handleTyping,
    handleInputFocus,
    handleInputBlur,
    markConversationAsRead
  } = useChat(conversation, currentUser, onMessageSent, onMarkAsRead)

  if (isLoading) {
    return <LoadingSkeleton type="chat" />
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-dark-700 h-full flex flex-col">
      {/* Header */}
      <ChatHeader
        participant={otherParticipant}
        isConnected={isConnected}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-2 chat-messages bg-gradient-to-b from-dark-800 to-dark-900" style={{ height: '0' }}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-dark-400">No messages yet</p>
            <p className="text-sm text-dark-500">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message) => {
              if (!message || !message.senderId || !currentUser?._id) {
                return null
              }
              
              let messageSenderId
              if (typeof message.senderId === 'string') {
                messageSenderId = message.senderId
              } else if (message.senderId && typeof message.senderId === 'object' && message.senderId._id) {
                messageSenderId = message.senderId._id
              } else {
                messageSenderId = message.senderId?.toString() || ''
              }
              
              const currentUserId = currentUser._id?.toString()
              
              if (!messageSenderId || !currentUserId) {
                return null
              }
              
              const isOwnMessage = messageSenderId === currentUserId
              
              return (
                <Message
                  key={message._id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                />
              )
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      <TypingIndicator users={typingUsers} />

      {/* Message Input */}
      <MessageInput
        value={newMessage}
        onChange={handleTyping}
        onSend={sendMessage}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        disabled={isSending}
        isSending={isSending}
      />
    </div>
  )
}
