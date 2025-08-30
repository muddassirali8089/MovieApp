import { User } from 'lucide-react'

export default function Avatar({ 
  src, 
  alt, 
  size = "md", 
  className = "",
  showStatus = false,
  statusColor = "green"
}) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  }
  
  const statusColors = {
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    gray: "bg-gray-500"
  }

  return (
    <div className={`relative flex-shrink-0 ${sizes[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizes[size]} bg-primary-600 rounded-full flex items-center justify-center`}>
          <User className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : size === 'lg' ? 'w-6 h-6' : 'w-8 h-8'} text-white`} />
        </div>
      )}
      
      {showStatus && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 ${statusColors[statusColor]} rounded-full border-2 border-dark-800`} />
      )}
    </div>
  )
}
