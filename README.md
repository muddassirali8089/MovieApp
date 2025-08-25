# 🎬 Movie App - Full Stack Project

A complete movie application with user authentication, ratings, recommendations, and a beautiful UI built with Next.js frontend and Node.js backend.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for image uploads)

## 📁 Project Structure

```
MovieApp/
├── movieFrontend/          # Next.js Frontend
├── movieApiBackend/
                     /recommendationService        # Node.js services
└── README.md
```

## 🔧 Backend Setup

### 1. Navigate to Backend
```bash
cd movieApiBackend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in `movieApiBackend/` directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/movieapp
# or your MongoDB Atlas connection string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=7000
NODE_ENV=development

# Recommendation Service
RECOMMENDATION_SERVICE_URL=http://localhost:5000
```

### 4. Start Backend Server
```bash
npm start
# or
npm run dev
```

**Backend will run on:** `http://localhost:7000`

## 🎯 Recommendation Service Setup

### 1. Navigate to Recommendation Service
```bash
cd movieApiBackend/recommendationService
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Optional)
Create a `.env` file in `recommendationService/` directory if you want to customize:

```env
# Recommendation Service Port (default: 5000)
RECOMMENDATION_SERVICE_PORT=5000

# Frontend URL for CORS (optional)
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Start Recommendation Service
```bash
npm start
# or
npm run dev
```

**Recommendation Service will run on:** `http://localhost:5000`

### 6. Service Dependencies
The recommendation service requires:
- **Main Backend**: Must be running on port 7000
- **Database**: MongoDB connection (handled by main backend)
- **Port 5000**: Available for the microservice

## 🎨 Frontend Setup

### 1. Navigate to Frontend
```bash
cd movieFrontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

## 🌐 API Endpoints

### Public Routes
- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/categories` - Get all categories
- `GET /api/v1/movies/:id` - Get single movie
- `GET /api/v1/movies/:id/ratings` - Get movie ratings

### Protected Routes (Login Required)
- `POST /api/v1/movies` - Upload new movie
- `POST /api/v1/movies/:id/rate` - Rate a movie
- `GET /api/v1/movies/recommendations` - Get personalized recommendations
- `GET /api/v1/movies/my-ratings` - Get user's rated movies
- `GET /api/v1/users/my-ratings` - Get user's ratings

## 🗄️ Database Setup

### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/movieapp`

### Option 2: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Get connection string and add to `.env`

## ☁️ Cloudinary Setup (Image Uploads)

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your credentials from Dashboard
3. Add to `.env` file:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 🔑 Authentication

The app uses JWT tokens stored in `localStorage` as `auth_token`.

### Login Flow:
1. User logs in with email/password
2. Backend returns JWT token
3. Frontend stores token in `localStorage`
4. Token is sent with API requests

## 📱 Features

- **User Authentication** - Sign up, login, logout
- **Movie Management** - Upload, view, search movies
- **Rating System** - Rate movies 1-5 stars
- **Recommendations** - AI-powered movie suggestions
- **Responsive Design** - Works on all devices
- **Image Uploads** - Cloudinary integration
- **Category Filtering** - Browse by genre

## 🛠️ Development Commands

### Backend
```bash
cd movieApiBackend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test
```

### Recommendation Service
```bash
cd movieApiBackend/recommendationService

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Health check
curl http://localhost:5000/health
```

### Frontend
```bash
cd movieFrontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## 🔍 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill process using the port

3. **Image Upload Fails**
   - Verify Cloudinary credentials
   - Check image file size and format

4. **JWT Token Issues**
   - Clear `localStorage`
   - Check `JWT_SECRET` in backend `.env`

## 📋 Environment Variables Summary

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/movieapp
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=7000
NODE_ENV=development
```

### Frontend
- No `.env` file needed
- API base URL is hardcoded to `http://localhost:7000`

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in `.env`
2. Use MongoDB Atlas for database
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Run `npm run build`
2. Deploy `out` folder to Vercel, Netlify, or any static hosting

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section
2. Verify all environment variables are set
3. Ensure MongoDB and Cloudinary are properly configured
4. Check console logs for error messages

## 🎯 Quick Test

After setup, test the app:
1. Open `http://localhost:3000`
2. Sign up for a new account
3. Upload a movie
4. Rate some movies
5. Check recommendations

**Testing Recommendation Service:**
1. Ensure recommendation service is running on port 5000
2. Rate some movies with 4-5 stars
3. Check recommendations page for personalized suggestions
4. Verify console logs show recommendation generation

---

**Happy Coding! 🎬✨**
