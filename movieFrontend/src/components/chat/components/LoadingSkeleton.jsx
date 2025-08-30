export default function LoadingSkeleton({ 
  type = "conversation", 
  className = "" 
}) {
  if (type === "conversation") {
    return (
      <div className={`bg-dark-800 rounded-xl border border-dark-700 p-4 h-full ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-dark-700 rounded-lg"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-dark-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === "chat") {
    return (
      <div className={`bg-dark-800 rounded-xl border border-dark-700 h-full flex flex-col ${className}`}>
        <div className="animate-pulse space-y-4 p-4">
          <div className="h-12 bg-dark-700 rounded-lg"></div>
          <div className="space-y-3 flex-1">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-dark-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}
