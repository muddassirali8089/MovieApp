'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, Star, Calendar, TrendingUp, Grid, List } from 'lucide-react'
import MovieCard from '@/components/MovieCard'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import toast from 'react-hot-toast'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('title')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get query params if available
    const categoryFromUrl = searchParams.get('category')
    const searchFromUrl = searchParams.get('search')
    const sortFromUrl = searchParams.get('sort')
    
    if (categoryFromUrl) setSelectedCategory(categoryFromUrl)
    if (searchFromUrl) setSearchQuery(searchFromUrl)
    if (sortFromUrl) setSortBy(sortFromUrl)
    
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
      console.error('Error fetching movies page data:', error)
      toast.error('Failed to load movies data')
      setMovies([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  const handleSortChange = (sort) => {
    setSortBy(sort)
  }

  const filteredMovies = Array.isArray(movies) ? movies.filter(movie => {
    const matchesCategory = selectedCategory === 'all' || 
      movie.category?.name === selectedCategory
    const matchesSearch = searchQuery === '' || 
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  }) : []

  const sortedMovies = [...filteredMovies].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0)
      case 'date':
        return new Date(b.releaseDate) - new Date(a.releaseDate)
      case 'title':
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
            All Movies
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Discover and explore our complete collection of movies across all genres
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search movies by title or description..."
                  className="w-full pl-12 pr-4 py-3 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 sm:px-6 sm:py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-600'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-dark-700 pt-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => handleSortChange(e.target.value)}
                      className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="title">Title A-Z</option>
                      <option value="rating">Highest Rated</option>
                      <option value="date">Newest First</option>
                    </select>
                  </div>

                  {/* View Mode */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">View Mode</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'grid' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          viewMode === 'list' 
                            ? 'bg-primary-600 text-white' 
                            : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-dark-300">
            Found {sortedMovies.length} movie{sortedMovies.length !== 1 ? 's' : ''}
            {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <TrendingUp className="w-4 h-4" />
            <span>Showing {sortedMovies.length} of {movies.length} total movies</span>
          </div>
        </motion.div>

        {/* Movies Display */}
        {sortedMovies.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
              </div>
            ) : (
              <div className="space-y-4">
                {sortedMovies.map((movie, index) => (
                  <motion.div
                    key={movie._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-dark-800 rounded-xl p-4 border border-dark-700 hover:border-primary-500/30 transition-all duration-200"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-28 bg-dark-700 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{movie.title}</h3>
                        <p className="text-dark-300 text-sm mb-3 line-clamp-2">{movie.description}</p>
                        <div className="flex items-center gap-4 text-sm text-dark-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            {movie.averageRating?.toFixed(1) || '0.0'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(movie.releaseDate).getFullYear()}
                          </span>
                          <span className="px-2 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs">
                            {movie.category?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
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
              {searchQuery 
                ? `No movies found matching "${searchQuery}"`
                : selectedCategory !== 'all'
                ? `No movies found in ${selectedCategory} category`
                : 'No movies available at the moment'
              }
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                }}
                className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
