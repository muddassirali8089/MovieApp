# Movie App API Documentation

## Base URL
```
http://localhost:7000/api/v1
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 🔐 Authentication

#### 1. User Signup
- **POST** `/users/signup`
- **Description**: Create a new user account
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "address": "123 Main St, City"
  }
  ```
- **Response**: JWT token + user data

#### 2. User Login
- **POST** `/users/login`
- **Description**: Authenticate user and get JWT token
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: JWT token + user data

### 👤 User Profile

#### 3. Get User Profile
- **GET** `/users/me`
- **Access**: Private (requires JWT)
- **Response**: User profile data

#### 4. Update User Profile
- **PATCH** `/users/updateProfile`
- **Access**: Private (requires JWT)
- **Body**:
  ```json
  {
    "name": "John Smith",
    "address": "456 Oak Ave, Town",
    "dateOfBirth": "1990-01-01"
  }
  ```
- **Response**: Updated user data

### 🎬 Movies

#### 5. Get All Movies
- **GET** `/movies`
- **Access**: Public
- **Query Parameters**:
  - `category`: Filter by category name (Action, Horror, Comedy, Animated)
  - `search`: Search in title and description
  - `sort`: Sort by "title", "rating", or "date"
- **Example**: `/movies?category=Action&search=action&sort=rating`

#### 6. Get Single Movie
- **GET** `/movies/:id`
- **Access**: Public
- **Response**: Movie details with category and ratings

#### 7. Upload New Movie
- **POST** `/movies`
- **Access**: Private (requires JWT)
- **Body**: Form data with `image` file
  ```
  title: "Movie Title"
  description: "Movie description"
  category: "Action"
  releaseDate: "2024-01-01"
  image: [file upload]
  ```

### 📂 Categories

#### 8. Get All Categories
- **GET** `/movies/categories`
- **Access**: Public
- **Response**: List of available categories

### ⭐ Ratings

#### 9. Rate a Movie
- **POST** `/movies/:id/rate`
- **Access**: Private (requires JWT)
- **Body**:
  ```json
  {
    "rating": 5
  }
  ```
- **Response**: Rating confirmation + updated movie stats

#### 10. Get My Rating
- **GET** `/movies/:id/my-rating`
- **Access**: Private (requires JWT)
- **Response**: User's rating for the movie

#### 11. Get Movie Ratings
- **GET** `/movies/:id/ratings`
- **Access**: Public
- **Response**: All ratings for the movie

## Data Models

### User
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "profileImage": "cloudinary_url",
  "dateOfBirth": "1990-01-01T00:00:00.000Z",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Movie
```json
{
  "_id": "movie_id",
  "title": "Movie Title",
  "description": "Movie description",
  "category": "category_id",
  "image": "cloudinary_url",
  "releaseDate": "2024-01-01T00:00:00.000Z",
  "ratings": [
    {
      "user": "user_id",
      "rating": 5
    }
  ],
  "averageRating": 4.5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Category
```json
{
  "_id": "category_id",
  "name": "Action",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Rating
```json
{
  "_id": "rating_id",
  "user": "user_id",
  "movie": "movie_id",
  "rating": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

All errors follow this format:
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

## Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **500**: Internal Server Error

## Usage Examples

### 1. Search for Action movies with "action" in title
```
GET /movies?category=Action&search=action
```

### 2. Get movies sorted by rating
```
GET /movies?sort=rating
```

### 3. Rate a movie (requires authentication)
```
POST /movies/movie_id/rate
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
  "rating": 5
}
```

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables** in `.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. **Seed the database**:
   ```bash
   node dev-data/seed.js
   ```

4. **Start the server**:
   ```bash
   npm start
   ```

## Features Implemented

✅ User authentication (signup/login)  
✅ JWT token-based authorization  
✅ User profile management  
✅ Movie CRUD operations  
✅ Category management  
✅ Movie rating system (1-5 scale)  
✅ Search and filtering  
✅ Image upload to Cloudinary  
✅ MongoDB integration  
✅ Comprehensive error handling  
✅ Input validation  
✅ Rate limiting (configured but commented)  

## Next Steps for Frontend Integration

1. Implement user registration/login forms
2. Create movie browsing interface with filters
3. Add movie rating functionality
4. Build user profile management
5. Implement movie upload for admins
6. Add search functionality
7. Create responsive design for mobile/desktop
