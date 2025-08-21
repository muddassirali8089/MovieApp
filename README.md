# MovieZone - Full Stack Movie Application

A modern movie discovery and rating platform built with Node.js backend and Next.js frontend.

## 🚀 Features

- **User Authentication** - Signup, login, and profile management
- **Movie Management** - Browse, search, and filter movies by category
- **Rating System** - Rate movies from 1-5 stars
- **Responsive Design** - Modern UI that works on all devices
- **Real-time Search** - Instant movie search and filtering

## 🏗️ Architecture

- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens
- **File Upload**: Cloudinary integration
- **Styling**: Tailwind CSS + Framer Motion

## 📁 Project Structure

```
MovieApp/
├── movieApiBackend/          # Backend API server
│   ├── controllers/          # API controllers
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   ├── utils/               # Utility functions
│   └── dev-data/            # Seed data and scripts
├── movieFrontend/           # Next.js frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable components
│   │   └── styles/          # Global styles
│   └── public/              # Static assets
└── README.md                # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd movieApiBackend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Fill in your MongoDB connection string
   - Add Cloudinary credentials (optional)

4. **Database Setup:**
   ```bash
   # Start MongoDB (if local)
   mongod
   
   # Seed the database
   npm run seed
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:7000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd movieFrontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 🔐 Security & Environment Variables

### Critical Security Notes

⚠️ **NEVER commit these files to Git:**
- `.env` files
- Database credentials
- API keys
- Private keys

### Required Environment Variables

Create a `.env` file in `movieApiBackend/`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/moviezone
# or for Atlas: mongodb+srv://username:password@cluster.mongodb.net/moviezone

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=90d

# Server
PORT=7000
NODE_ENV=development

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🗄️ Database Models

### User Model
- Name, email, password (hashed)
- Profile image, address, date of birth
- Created/updated timestamps

### Movie Model
- Title, description, release date
- Category reference, image URL
- Average rating, ratings array

### Category Model
- Name (Action, Horror, Comedy, Animated)

### Rating Model
- User reference, movie reference
- Rating value (1-5), timestamp

## 🚀 API Endpoints

### Authentication
- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User login

### Movies
- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/:id` - Get single movie
- `POST /api/v1/movies/:id/rate` - Rate a movie
- `GET /api/v1/movies/categories` - Get categories

### User Profile
- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update profile

## 🎨 Frontend Features

### Pages
- **Home** (`/`) - Movie grid with search and filters
- **Categories** (`/categories`) - Browse by genre
- **Movies** (`/movies`) - Advanced movie browsing
- **Movie Detail** (`/movie/[id]`) - Individual movie view
- **Profile** (`/profile`) - User profile management
- **Auth** (`/login`, `/signup`) - Authentication pages

### Components
- Responsive movie cards
- Search and filter interfaces
- Category navigation
- Rating system
- Loading skeletons
- Toast notifications

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Start development server
npm run start        # Start production server
npm run seed         # Seed database with sample data
```

**Frontend:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Quality

- ESLint configuration
- Prettier formatting
- Consistent code style
- Error handling patterns

## 🚀 Deployment

### Backend Deployment
- Use environment variables for production
- Set `NODE_ENV=production`
- Use strong JWT secrets
- Enable CORS for your domain

### Frontend Deployment
- Build with `npm run build`
- Deploy to Vercel, Netlify, or similar
- Update API endpoints for production

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **Port Already in Use**
   - Change port in `.env` file
   - Kill existing processes on the port

3. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits

4. **Frontend Build Errors**
   - Clear `.next` folder
   - Reinstall dependencies

### Getting Help

- Check the console for error messages
- Verify all environment variables are set
- Ensure both backend and frontend are running
- Check MongoDB connection status

## 🔮 Future Enhancements

- [ ] User watchlists and favorites
- [ ] Advanced search filters
- [ ] Movie recommendations
- [ ] Social features (reviews, comments)
- [ ] Mobile app
- [ ] Admin dashboard
- [ ] Analytics and insights

---

**Happy Coding! 🎬✨**
