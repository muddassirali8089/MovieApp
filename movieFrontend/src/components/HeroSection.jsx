'use client'

import { motion } from 'framer-motion'
import { Play, Star, TrendingUp, Users } from 'lucide-react'

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-dark-800 to-dark-900" />
      
      {/* Background Pattern */}
      {/* <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
      </div> */}

      {/* Content */}
      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main Heading */}
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="gradient-text">MovieZone</span>
            <br />
            <span className="text-white">Your Ultimate Movie Experience</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl md:text-2xl text-dark-200 mb-8 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Discover, rate, and explore the best movies across all genres. 
            Your personal movie companion with stunning visuals and seamless experience.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="btn-primary text-lg px-8 py-4 flex items-center gap-2 group">
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Explore Movies
            </button>
            <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Rate & Review
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary-600/20 rounded-full">
                  <TrendingUp className="w-6 h-6 text-primary-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">1000+</h3>
              <p className="text-dark-300">Movies Available</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary-600/20 rounded-full">
                  <Star className="w-6 h-6 text-primary-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">50K+</h3>
              <p className="text-dark-300">Ratings Given</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary-600/20 rounded-full">
                  <Users className="w-6 h-6 text-primary-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">10K+</h3>
              <p className="text-dark-300">Happy Users</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-auto">
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-dark-800"
          />
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.71,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-dark-800"
          />
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-dark-900"
          />
        </svg>
      </div>
    </div>
  )
}
