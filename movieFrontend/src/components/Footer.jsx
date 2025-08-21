'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Film, Heart, Github, Twitter, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    'Movies': [
      { name: 'Browse All', href: '/' },
      { name: 'Categories', href: '/categories' },
      { name: 'Top Rated', href: '/?sort=rating' },
      { name: 'Latest Releases', href: '/?sort=date' }
    ],
    'Account': [
      { name: 'Sign Up', href: '/signup' },
      { name: 'Login', href: '/login' },
      { name: 'Profile', href: '/profile' },
      { name: 'Favorites', href: '/favorites' }
    ],
    'Support': [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' }
    ]
  }

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com', color: 'hover:text-gray-400' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: 'hover:text-pink-400' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@moviezone.com', color: 'hover:text-red-400' }
  ]

  return (
    <footer className="bg-dark-900 border-t border-dark-700 mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Film className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold gradient-text">MovieZone</span>
            </Link>
            <p className="text-dark-300 mb-4 max-w-md">
              Your ultimate destination for discovering, rating, and exploring the best movies across all genres. 
              Join our community of movie enthusiasts today!
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-dark-800 rounded-lg text-dark-400 transition-colors duration-200 ${social.color}`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-dark-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-dark-700 pt-8 mb-8">
          <div className="text-center">
            <h3 className="text-white text-lg font-semibold mb-2">Stay Updated</h3>
            <p className="text-dark-300 mb-4">Get the latest movie recommendations and updates</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
              <motion.button
                className="btn-primary px-6 py-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-dark-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <span>© {currentYear} MovieZone. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-dark-400">
              <span>Made with</span>
              <motion.div
                className="text-red-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              >
                <Heart className="w-4 h-4 fill-current" />
              </motion.div>
              <span>by MovieZone Team</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
