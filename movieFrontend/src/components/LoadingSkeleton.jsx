'use client'

import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  const skeletonItems = Array.from({ length: 10 }, (_, i) => i)

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section Skeleton */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-800 to-dark-900" />
        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <motion.div 
              className="h-16 bg-dark-700 rounded-lg mx-auto max-w-md"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div 
              className="h-8 bg-dark-700 rounded-lg mx-auto max-w-2xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div 
              className="h-12 bg-dark-700 rounded-lg mx-auto max-w-xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filter Skeleton */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <motion.div 
              className="h-12 bg-dark-700 rounded-xl w-full max-w-md"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <div className="flex items-center gap-4">
              <motion.div 
                className="h-10 bg-dark-700 rounded-lg w-32"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
              />
              <motion.div 
                className="h-10 bg-dark-700 rounded-lg w-40"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
            </div>
          </div>
        </div>

        {/* Results Count Skeleton */}
        <div className="mb-6">
          <motion.div 
            className="h-6 bg-dark-700 rounded w-48"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </div>

        {/* Movies Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {skeletonItems.map((item) => (
            <motion.div
              key={item}
              className="bg-dark-800 rounded-xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: item * 0.1 }}
            >
              {/* Poster Skeleton */}
              <div className="relative aspect-[2/3] bg-dark-700">
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-dark-700 via-dark-600 to-dark-700"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 }}
                />
              </div>

              {/* Content Skeleton */}
              <div className="p-4 space-y-3">
                <motion.div 
                  className="h-6 bg-dark-700 rounded w-3/4"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 }}
                />
                <div className="flex gap-2">
                  <motion.div 
                    className="h-5 bg-dark-700 rounded-full w-16"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 + 0.1 }}
                  />
                  <motion.div 
                    className="h-5 bg-dark-700 rounded-full w-20"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 + 0.2 }}
                  />
                </div>
                <motion.div 
                  className="h-4 bg-dark-700 rounded w-full"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 + 0.3 }}
                />
                <motion.div 
                  className="h-4 bg-dark-700 rounded w-2/3"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 + 0.4 }}
                />
                <div className="flex gap-2">
                  <motion.div 
                    className="h-8 bg-dark-700 rounded-lg flex-1"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 + 0.5 }}
                  />
                  <motion.div 
                    className="h-8 bg-dark-700 rounded-lg w-10"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: item * 0.1 + 0.6 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
