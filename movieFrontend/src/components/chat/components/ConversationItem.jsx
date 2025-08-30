import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'
import Avatar from './Avatar'
import { getOtherParticipant, getLastMessagePreview, formatLastActivity, hasUnreadMessages } from '../utils/chatUtils'

export default function ConversationItem({ 
  conversation, 
  currentUserId, 
  isSelected, 
  onSelect, 
  onDelete,
  className = ""
}) {
  const otherParticipant = getOtherParticipant(conversation, currentUserId)
  
  if (!otherParticipant) return null
  
  const hasUnread = hasUnreadMessages(conversation, currentUserId)

  return (
    <motion.div
      className={`relative group cursor-pointer rounded-lg transition-all duration-200 ${
        isSelected 
          ? 'bg-primary-600/20 border border-primary-500/30' 
          : 'hover:bg-dark-700 border border-transparent'
      } ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="p-3"
        onClick={() => onSelect(conversation)}
      >
        <div className="flex items-start gap-3">
          <Avatar
            src={otherParticipant.profileImage}
            alt={otherParticipant.name}
            showStatus={hasUnread}
            statusColor="red"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white truncate">
                {otherParticipant.name}
              </h3>
              <span className="text-xs text-dark-400">
                {formatLastActivity(conversation.lastActivity)}
              </span>
            </div>
            <p className={`text-sm truncate ${
              hasUnread ? 'text-white font-medium' : 'text-dark-400'
            }`}>
              {getLastMessagePreview(conversation)}
            </p>
          </div>

          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conversation._id)
              }}
              className="p-1 text-dark-400 hover:text-red-400 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
