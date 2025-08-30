import { motion } from 'framer-motion'
import { formatMessageTime } from '../utils/chatUtils'

export default function Message({ message, isOwnMessage, className = "" }) {
  if (!message || !message.content) {
    return null
  }

  return (
    <motion.div
      className={`flex message-container ${isOwnMessage ? 'justify-end sender-message' : 'justify-start receiver-message'} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`max-w-xs lg:max-w-md px-2 py-1 rounded-md shadow-sm message-bubble ${
        isOwnMessage 
          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md' 
          : 'bg-gradient-to-br from-dark-700 to-dark-600 text-white rounded-bl-md'
      }`}>
        <p className="text-xs leading-tight">{message.content}</p>
        <div className={`flex items-center justify-between mt-1 ${
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
}
