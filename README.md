# 🎬 Movie App - Full Stack Project

A complete movie application with user authentication, ratings, recommendations, and a beautiful UI built with **Next.js frontend** and **NestJS backend** with **microservice architecture**.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB database
- Cloudinary account (for image uploads)
- NestJS CLI (`npm install -g @nestjs/cli`)

## 📁 Project Structure

```
MovieApp/
├── movieFrontend/          # Next.js Frontend (port 3000)
├── movie-backend/          # NestJS Main Backend (port 7000)
├── rec-service/            # NestJS Recommendation Microservice (port 5000)
└── README.md
```

## 🔧 Main Backend Setup (NestJS)

### 1. Navigate to Main Backend
```bash
cd movie-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in `movie-backend/` directory:

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
```

### 4. Build and Start Backend Server
```bash
# Build the project
npm run build

# Start development server
npm run start:dev

# Start production server
npm start
```

**Main Backend will run on:** `http://localhost:7000`

## 🎯 Recommendation Microservice Setup (NestJS)

### 1. Navigate to Recommendation Microservice
```bash
cd rec-service
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables (Optional)
Create a `.env` file in `rec-service/` directory if you want to customize:

```env
# Recommendation Service Port (default: 5000)
PORT=5000

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 4. Build and Start Microservice
```bash
# Build the project
npm run build

# Start development server (with auto-reload)
npm run start:dev

# Start production server
npm run start:prod

# Alternative: Start with nodemon (if needed)
npm run start:nodemon
```

**Recommendation Microservice will run on:** `http://localhost:5000`

### 5. Service Dependencies
The recommendation microservice requires:
- **Main Backend**: Must be running on port 7000
- **Port 5000**: Available for the microservice
- **No database dependency**: Pure business logic service

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

### Main Backend (Port 7000)
#### Public Routes
- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/categories` - Get all categories
- `GET /api/v1/movies/:id` - Get single movie
- `GET /api/v1/movies/:id/ratings` - Get movie ratings

#### Protected Routes (Login Required)
- `POST /api/v1/movies` - Upload new movie
- `POST /api/v1/movies/:id/rate` - Rate a movie
- `GET /api/v1/movies/recommendations` - Get personalized recommendations
- `GET /api/v1/movies/my-ratings` - Get user's rated movies
- `GET /api/v1/users/my-ratings` - Get user's ratings

### Recommendation Microservice (Port 5000)
- `GET /health` - Health check
- `POST /recommendations` - Get movie recommendations (excludes movies rated below 3 stars)

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
- **Smart Recommendations** - Excludes movies rated below 3 stars
- **Microservice Architecture** - Independent recommendation service
- **Responsive Design** - Works on all devices
- **Image Uploads** - Cloudinary integration
- **Category Filtering** - Browse by genre

## 🏗️ Microservice Architecture

### **Main Backend (Port 7000)**
- **NestJS Framework** - Modern, scalable Node.js framework
- **MongoDB Integration** - User data, movies, ratings
- **JWT Authentication** - Secure user sessions
- **Cloudinary Integration** - Image uploads and storage
- **API Gateway** - Routes requests to microservices

### **Recommendation Microservice (Port 5000)**
- **Pure Business Logic** - No database dependencies
- **Smart Filtering** - Excludes movies rated 1-2 stars
- **Independent Service** - Can be deployed separately
- **RESTful API** - Simple HTTP endpoints
- **CORS Enabled** - Cross-origin requests supported

### **Communication Flow**
```
Frontend Request → Main Backend → Recommendation Microservice → Response
```

## 🛠️ Development Commands

### Main Backend (NestJS)
```bash
cd movie-backend

# Install dependencies
npm install

# Build the project
npm run build

# Start development server (with auto-reload)
npm run start:dev

# Start production server
npm start

# Run tests
npm test
```

### Recommendation Microservice (NestJS)
```bash
cd rec-service

# Install dependencies
npm install

# Build the project
npm run build

# Start development server (with auto-reload)
npm run start:dev

# Start production server
npm run start:prod

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

### Main Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/movieapp
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=7000
NODE_ENV=development
```

### Recommendation Microservice (.env)
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend
- No `.env` file needed
- API base URL is hardcoded to `http://localhost:7000`

## 🚀 Deployment

### Main Backend Deployment (NestJS)
1. Set `NODE_ENV=production` in `.env`
2. Use MongoDB Atlas for database
3. Build with `npm run build`
4. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Recommendation Microservice Deployment (NestJS)
1. Set `NODE_ENV=production` in `.env`
2. Build with `npm run build`
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Ensure port 5000 is available or configure custom port

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

**Testing Recommendation Microservice:**
1. Ensure microservice is running on port 5000
2. Rate some movies with 1-2 stars (these will be excluded)
3. Rate some movies with 4-5 stars (these will influence recommendations)
4. Check recommendations page for personalized suggestions
5. Verify console logs show recommendation generation and exclusion

**Architecture Flow:**
```
Frontend (3000) → Main Backend (7000) → Recommendation Microservice (5000)
```

---

**Happy Coding! 🎬✨**
