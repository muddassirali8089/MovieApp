'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Star,
  Home,
  Film,
  Sparkles
} from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-dropdown')) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isUserMenuOpen])

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    setIsMenuOpen(false)
    router.push('/')
  }

  const closeUserMenu = () => {
    setIsUserMenuOpen(false)
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Movies', href: '/movies', icon: Film },
    { name: 'Categories', href: '/categories', icon: Star },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-dark-900/95 backdrop-blur-md border-b border-dark-700/50' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Film className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">MovieZone</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-primary-400 transition-colors">
              Home
            </Link>
            <Link href="/movies" className="text-white hover:text-primary-400 transition-colors">
              Movies
            </Link>
            <Link href="/categories" className="text-white hover:text-primary-400 transition-colors">
              Categories
            </Link>
            {user && (
              <Link href="/recommendations" className="text-white hover:text-primary-400 transition-colors flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recommendations
              </Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative user-dropdown">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.profileImage ? (
                    <img 
                      src={user.profileImage} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-600"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="hidden sm:block">{user.name}</span>
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl py-2"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 py-2 border-b border-dark-600">
                        <p className="text-sm text-white font-medium">{user.name}</p>
                        <p className="text-xs text-dark-400">{user.email}</p>
                        {user.address && (
                          <p className="text-xs text-dark-400 mt-1">{user.address}</p>
                        )}
                        {user.dateOfBirth && (
                          <p className="text-xs text-dark-400">
                            {new Date(user.dateOfBirth).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="py-1">
                        <Link href="/profile" onClick={closeUserMenu}>
                          <button className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Profile
                          </button>
                        </Link>
                        <Link href="/recommendations" onClick={closeUserMenu}>
                          <button className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Recommendations
                          </button>
                        </Link>
                        <Link href="/my-ratings" onClick={closeUserMenu}>
                          <button className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            My Ratings
                          </button>
                        </Link>
                        <button className="w-full px-4 py-2 text-left text-sm text-dark-300 hover:text-white hover:bg-dark-700 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-dark-700 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <motion.button
                    className="btn-secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Login
                  </motion.button>
                </Link>
                <Link href="/signup">
                  <motion.button
                    className="btn-primary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-white hover:text-primary-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-dark-800 border-t border-dark-700 py-4"
          >
            <nav className="flex flex-col space-y-4 px-6">
              <Link href="/" className="text-white hover:text-primary-400 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/movies" className="text-white hover:text-primary-400 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Movies
              </Link>
              <Link href="/categories" className="text-white hover:text-primary-400 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                Categories
              </Link>
              {user ? (
                <>
                  <Link href="/recommendations" className="text-white hover:text-primary-400 transition-colors py-2 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                    <Sparkles className="w-4 h-4" />
                    Recommendations
                  </Link>
                  <Link href="/profile" className="text-white hover:text-primary-400 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link href="/my-ratings" className="text-white hover:text-primary-400 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    My Ratings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-primary-400 transition-colors py-2 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-white hover:text-primary-400 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Login
                  </Link>
                  <Link href="/signup" className="text-white hover:text-primary-400 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  )
}
