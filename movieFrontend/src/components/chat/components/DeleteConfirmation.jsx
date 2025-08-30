import { motion } from 'framer-motion'
import Button from './Button'

export default function DeleteConfirmation({ 
  isVisible, 
  onConfirm, 
  onCancel, 
  className = "" 
}) {
  if (!isVisible) return null

  return (
    <motion.div
      className={`absolute top-full left-0 right-0 mt-1 bg-dark-700 border border-dark-600 rounded-lg p-3 z-10 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <p className="text-sm text-white mb-3">Delete this conversation?</p>
      <div className="flex gap-2">
        <Button
          onClick={onConfirm}
          variant="danger"
          size="sm"
        >
          Delete
        </Button>
        <Button
          onClick={onCancel}
          variant="secondary"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  )
}
