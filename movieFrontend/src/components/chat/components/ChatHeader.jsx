import Avatar from './Avatar'

export default function ChatHeader({ 
  participant, 
  isConnected, 
  className = "" 
}) {
  return (
    <div className={`p-4 border-b border-dark-700 flex-shrink-0 ${className}`}>
      {/* Connection Status */}
      <div className="mb-2 text-xs">
        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <Avatar
          src={participant?.profileImage}
          alt={participant?.name}
          size="md"
        />
        <div>
          <h3 className="font-semibold text-white">{participant?.name}</h3>
          <p className="text-sm text-dark-400">{participant?.email}</p>
        </div>
      </div>
    </div>
  )
}
