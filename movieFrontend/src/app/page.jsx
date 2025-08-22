'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Star, 
  Search, 
  Filter, 
  TrendingUp, 
  Clock,
  Award
} from 'lucide-react'
import MovieCard from '@/components/MovieCard'

import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import HeroSection from '@/components/HeroSection'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import toast from 'react-hot-toast'

export default function HomePage() {
  const [movies, setMovies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('title')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [moviesRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:7000/api/v1/movies'),
        fetch('http://localhost:7000/api/v1/movies/categories')
      ])
      
      if (!moviesRes.ok || !categoriesRes.ok) {
        throw new Error(`Movies: ${moviesRes.status}, Categories: ${categoriesRes.status}`)
      }
      
      const moviesData = await moviesRes.json()
      const categoriesData = await categoriesRes.json()
      
      // Ensure movies is always an array
      const moviesArray = Array.isArray(moviesData.data?.movies) ? moviesData.data.movies : 
                         Array.isArray(moviesData.movies) ? moviesData.movies : 
                         Array.isArray(moviesData.data) ? moviesData.data : 
                         Array.isArray(moviesData) ? moviesData : []
      const categoriesArray = Array.isArray(categoriesData.data?.categories) ? categoriesData.data.categories :
                             Array.isArray(categoriesData.categories) ? categoriesData.categories :
                             Array.isArray(categoriesData.data) ? categoriesData.data : 
                             Array.isArray(categoriesData) ? categoriesData : []
      
      setMovies(moviesArray)
      setCategories(categoriesArray)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load movies or categories. Check backend.')
      setMovies([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const filteredMovies = Array.isArray(movies) ? movies.filter(movie => {
    const matchesCategory = selectedCategory === 'all' || 
      movie.category?.name === selectedCategory
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  }) : []

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.averageRating - a.averageRating
      case 'date':
        return new Date(b.releaseDate) - new Date(a.releaseDate)
      default:
        return a.title.localeCompare(b.title)
    }
  })

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search movies..."
            />
            
            <div className="flex items-center gap-4">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field  sm:min-w-[140px] text-sm"
              >
                <option value="title">Sort by Title</option>
                <option value="rating">Sort by Rating</option>
                <option value="date">Sort by Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-dark-300">
            Found {sortedMovies.length} movie{sortedMovies.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Movies Grid */}
        {sortedMovies.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {sortedMovies.map((movie, index) => (
              <motion.div
                key={movie._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-dark-300 mb-2">
              No movies found
            </h3>
            <p className="text-dark-400">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
