# Movie App Backend API

A complete Node.js backend API for a movie application with user authentication, movie management, ratings, and search functionality.

## 🚀 Features

- **User Authentication**: Signup, login with JWT tokens
- **User Profile Management**: Update profile, address, DOB, and preferred categories
- **Movie Management**: Upload, view, and search movies
- **Category System**: Action, Horror, Comedy, Animated
- **Rating System**: Users can rate movies from 1-5 stars
- **Search & Filtering**: Search by title/description, filter by category, sort by rating/date
- **Image Upload**: Cloudinary integration for profile and movie images
- **MongoDB Integration**: Robust database with Mongoose ODM
- **Security**: JWT authentication, password hashing, input validation

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account for image storage

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd movieApiBackend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** in `.env`:
   ```env
   NODE_ENV=development
   PORT=7000
   MONGODB_URI=mongodb://localhost:27017/movieapp
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=90d
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

## 🗄️ Database Setup

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Seed the database** with sample data:
   ```bash
   node dev-data/seed.js
   ```

   This will create:
   - 4 categories (Action, Horror, Comedy, Animated)
   - 20+ sample movies across all categories

## 🚀 Running the Application

### Development Mode
```bash
npm start
```

### Production Mode
```bash
npm run prod
```

The API will be available at `http://localhost:7000`

## 📚 API Endpoints

### Authentication
- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User login

### User Profile
- `GET /api/v1/users/me` - Get user profile
- `PATCH /api/v1/users/updateProfile` - Update user profile

### Movies
- `GET /api/v1/movies` - Get all movies (with search/filter/sort)
- `GET /api/v1/movies/:id` - Get single movie
- `POST /api/v1/movies` - Upload new movie
- `GET /api/v1/movies/categories` - Get all categories

### Ratings
- `POST /api/v1/movies/:id/rate` - Rate a movie
- `GET /api/v1/movies/:id/my-rating` - Get user's rating
- `GET /api/v1/movies/:id/ratings` - Get all ratings for a movie

## 🔍 API Usage Examples

### Search and Filter Movies
```bash
# Get all Action movies
GET /api/v1/movies?category=Action

# Search for movies with "action" in title/description
GET /api/v1/movies?search=action

# Sort movies by rating
GET /api/v1/movies?sort=rating

# Combine filters
GET /api/v1/movies?category=Action&search=action&sort=rating
```

### Rate a Movie
```bash
POST /api/v1/movies/movie_id/rate
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "rating": 5
}
```

## 🧪 Testing

Run the test suite to verify all endpoints:
```bash
node test-api.js
```

## 📁 Project Structure

```
movieApiBackend/
├── connection/          # Database connection
├── controllers/         # Route controllers
├── data/               # Data files
├── dev-data/           # Seed data and scripts
├── models/             # Mongoose models
├── routes/             # Express routes
├── uploads/            # Uploaded files
├── utils/              # Utility functions
├── index.js            # Main application file
├── package.json        # Dependencies
└── README.md           # This file
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Rate limiting (configured but commented)

## 🚧 Development Notes

- The recommendation system is left for future implementation
- Rate limiting is configured but commented out for development
- Image uploads are handled via Cloudinary
- All timestamps are automatically managed by Mongoose

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB is running
4. Check Cloudinary credentials

## 🎯 Next Steps

- [ ] Implement recommendation system
- [ ] Add admin role and permissions
- [ ] Implement movie reviews/comments
- [ ] Add pagination for large datasets
- [ ] Implement caching with Redis
- [ ] Add unit and integration tests
- [ ] Create frontend application (Next.js)

