'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Film, Star, Calendar, Play, Heart } from 'lucide-react'
import MovieCard from '@/components/MovieCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import toast from 'react-hot-toast'

export default function CategoriesPage() {
  const [movies, setMovies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get category from URL params if available
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
    fetchData()
  }, [searchParams])

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
      console.error('Error fetching categories page data:', error)
      toast.error('Failed to load categories data')
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
    return matchesCategory
  }) : []

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0)
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
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Movie Categories
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Explore movies by genre and discover your next favorite film
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleCategoryChange('all')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedCategory === 'all'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-600'
              }`}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryChange(category.name)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  selectedCategory === category.name
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700 border border-dark-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Sort and Results */}
        <motion.div
          className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="title">Sort by Title</option>
              <option value="rating">Sort by Rating</option>
              <option value="date">Sort by Date</option>
            </select>
          </div>
          
          <div className="text-dark-300">
            Found {sortedMovies.length} movie{sortedMovies.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          </div>
        </motion.div>

        {/* Movies Grid */}
        {sortedMovies.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold text-dark-300 mb-2">
              No movies found
            </h3>
            <p className="text-dark-400">
              {selectedCategory === 'all' 
                ? 'No movies available at the moment'
                : `No movies found in ${selectedCategory} category`
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
