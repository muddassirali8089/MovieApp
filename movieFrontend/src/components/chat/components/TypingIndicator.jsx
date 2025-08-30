export default function TypingIndicator({ users = [], className = "" }) {
  if (users.length === 0) return null

  return (
    <div className={`px-4 py-2 border-t border-dark-700 bg-dark-800/50 flex-shrink-0 ${className}`}>
      <div className="flex items-center gap-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-primary-400 rounded-full typing-dot"></div>
        </div>
        <span className="text-sm text-dark-400">
          {users.map(u => u.userName).join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
        </span>
      </div>
    </div>
  )
}
