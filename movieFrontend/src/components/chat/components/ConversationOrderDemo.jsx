import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Clock, TrendingUp } from 'lucide-react'

export default function ConversationOrderDemo() {
  const [conversations, setConversations] = useState([
    {
      _id: 'conv1',
      participants: [{ _id: 'user1', name: 'John Doe' }],
      lastMessage: { content: 'Hello there!', createdAt: '2024-01-15T10:00:00Z' },
      lastActivity: '2024-01-15T10:00:00Z'
    },
    {
      _id: 'conv2',
      participants: [{ _id: 'user2', name: 'Jane Smith' }],
      lastMessage: { content: 'How are you?', createdAt: '2024-01-15T11:00:00Z' },
      lastActivity: '2024-01-15T11:00:00Z'
    },
    {
      _id: 'conv3',
      participants: [{ _id: 'user3', name: 'Bob Wilson' }],
      lastMessage: { content: 'See you later!', createdAt: '2024-01-15T12:00:00Z' },
      lastActivity: '2024-01-15T12:00:00Z'
    }
  ])

  const addNewMessage = (conversationId) => {
    const now = new Date().toISOString()
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversationId 
          ? {
              ...conv,
              lastMessage: { 
                content: `New message at ${new Date().toLocaleTimeString()}`, 
                createdAt: now 
              },
              lastActivity: now
            }
          : conv
      )
    )
  }

  const sortConversations = () => {
    setConversations(prev => 
      [...prev].sort((a, b) => {
        const dateA = new Date(a.lastActivity || a.lastMessage?.createdAt || 0)
        const dateB = new Date(b.lastActivity || b.lastMessage?.createdAt || 0)
        return dateB.getTime() - dateA.getTime()
      })
    )
  }

  return (
    <div className="bg-dark-700 rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-primary-400" />
        <h3 className="text-white font-medium">Conversation Order Demo</h3>
      </div>
      
      <div className="space-y-2 mb-3">
        {conversations.map((conv, index) => (
          <motion.div
            key={conv._id}
            layout
            className="flex items-center justify-between bg-dark-600 rounded-lg p-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {index + 1}
              </div>
              <div>
                <p className="text-white font-medium">{conv.participants[0].name}</p>
                <p className="text-dark-300 text-sm">{conv.lastMessage.content}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-dark-400" />
              <span className="text-dark-300 text-xs">
                {new Date(conv.lastActivity).toLocaleTimeString()}
              </span>
              <button
                onClick={() => addNewMessage(conv._id)}
                className="px-2 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors"
              >
                New Msg
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={sortConversations}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Sort by Latest Activity
        </button>
        <button
          onClick={() => setConversations(prev => [...prev].reverse())}
          className="px-4 py-2 bg-dark-600 text-white rounded-lg hover:bg-dark-500 transition-colors"
        >
          Reverse Order
        </button>
      </div>
      
      <p className="text-dark-400 text-sm mt-3">
        💡 Click "New Msg" on any conversation to simulate a new message and see it move to the top!
      </p>
    </div>
  )
}
