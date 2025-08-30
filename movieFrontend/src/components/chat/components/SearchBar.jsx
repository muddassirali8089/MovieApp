import { Search } from 'lucide-react'

export default function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  autoFocus = false 
}) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        autoFocus={autoFocus}
      />
    </div>
  )
}
