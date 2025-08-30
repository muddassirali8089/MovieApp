import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import Button from './Button'

export default function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  onFocus, 
  onBlur, 
  disabled = false,
  isSending = false,
  className = ""
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim() || disabled || isSending) return
    onSend(e)
  }

  return (
    <div className={`p-4 border-t border-dark-700 flex-shrink-0 ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
          disabled={disabled || isSending}
        />
        <Button
          type="submit"
          disabled={!value.trim() || disabled || isSending}
          size="lg"
          icon={Send}
          loading={isSending}
        >
          Send
        </Button>
      </form>
    </div>
  )
}
