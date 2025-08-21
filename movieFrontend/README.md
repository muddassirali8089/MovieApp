# 🎬 MovieZone Frontend

A stunning, modern Next.js frontend for the MovieZone application with beautiful UI/UX design, smooth animations, and responsive design.

## ✨ Features

- **🎨 Modern Design**: Beautiful dark theme with gradient accents and glass effects
- **📱 Responsive**: Fully responsive design that works on all devices
- **🎭 Smooth Animations**: Framer Motion animations for delightful user experience
- **🔍 Advanced Search**: Real-time search with suggestions and filters
- **🎬 Movie Management**: Browse, filter, and sort movies by category, rating, and date
- **⭐ Rating System**: Interactive star ratings with visual feedback
- **🔐 Authentication**: Beautiful login/signup forms with validation
- **📱 Mobile-First**: Optimized for mobile devices with touch-friendly interactions
- **🎯 Performance**: Optimized images, lazy loading, and smooth scrolling

## 🚀 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **State Management**: Zustand
- **UI Components**: Custom components with Tailwind

## 🎨 Design System

### Colors
- **Primary**: Blue gradient (#0ea5e9 to #0284c7)
- **Dark Theme**: Rich dark colors (#0f172a to #475569)
- **Accents**: Subtle highlights and borders

### Components
- **Buttons**: Primary, secondary, and ghost variants
- **Cards**: Movie cards with hover effects
- **Forms**: Beautiful input fields with icons
- **Navigation**: Sticky header with smooth transitions

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.jsx         # Root layout
│   ├── page.jsx           # Homepage
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # Reusable components
│   ├── Header.jsx         # Navigation header
│   ├── HeroSection.jsx    # Hero section
│   ├── MovieCard.jsx      # Movie card component
│   ├── SearchBar.jsx      # Search functionality
│   ├── CategoryFilter.jsx # Category filtering
│   └── LoadingSkeleton.jsx # Loading states
└── utils/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on localhost:7000

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd movieFrontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:7000/api/v1
```

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- Extended animations
- Custom component classes
- Responsive breakpoints

## 📱 Pages & Routes

### Homepage (`/`)
- Hero section with call-to-action
- Movie grid with search and filters
- Category-based filtering
- Sorting options (title, rating, date)

### Login (`/login`)
- Beautiful login form
- Form validation
- Social login options
- Responsive design

### Signup (`/signup`)
- User registration form
- Password confirmation
- Address field (optional)
- Form validation

## 🎭 Components

### Header
- Sticky navigation
- User authentication status
- Mobile-responsive menu
- Smooth scroll effects

### MovieCard
- Movie poster with hover effects
- Rating display
- Category badges
- Action buttons

### SearchBar
- Real-time search
- Search suggestions
- Clear functionality
- Focus animations

### CategoryFilter
- Pill-style category buttons
- Active state indicators
- Smooth transitions
- Responsive layout

## 🎨 Customization

### Colors
Modify `tailwind.config.js` to change the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom primary colors
      },
      dark: {
        // Your custom dark theme colors
      }
    }
  }
}
```

### Animations
Customize animations in `tailwind.config.js`:

```javascript
animation: {
  'fade-in': 'fadeIn 0.5s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'scale-in': 'scaleIn 0.2s ease-out',
}
```

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile**: Single column layout, touch-friendly buttons
- **Tablet**: Two-column grid, optimized spacing
- **Desktop**: Multi-column grid, hover effects, advanced interactions

## 🚀 Performance Features

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Efficient caching strategies

## 🔐 Authentication

The frontend integrates with the backend authentication system:

- JWT token storage in localStorage
- Protected routes
- User state management
- Automatic token validation

## 🎬 Movie Features

### Search & Filter
- Real-time search across titles and descriptions
- Category-based filtering
- Multiple sorting options
- Results count display

### Movie Display
- Responsive grid layout
- Hover effects and animations
- Rating visualization
- Category badges

## 🧪 Testing

### Manual Testing
1. Test responsive design on different screen sizes
2. Verify form validation
3. Check authentication flow
4. Test search and filter functionality

### Browser Compatibility
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Setup
Ensure your production environment has:
- Proper API endpoints
- Environment variables
- SSL certificates
- CDN configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with details

## 🎯 Roadmap

- [ ] User profile management
- [ ] Movie rating system
- [ ] Favorites functionality
- [ ] Advanced search filters
- [ ] Movie recommendations
- [ ] Social features
- [ ] PWA capabilities

---

**Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion**
