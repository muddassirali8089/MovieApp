# Movie API Documentation

## Base URL
```
http://localhost:7000/api/v1
```

## Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Routes

### POST /users/signup
Create a new user account
- **Body**: `{ "name": "string", "email": "string", "password": "string", "confirmPassword": "string" }`
- **Response**: User data with JWT token

### POST /users/login
Authenticate user and get JWT token
- **Body**: `{ "email": "string", "password": "string" }`
- **Response**: User data with JWT token

### GET /users/profile
Get current user profile (Protected)
- **Headers**: Authorization token required
- **Response**: User profile data

## Movie Routes

### GET /movies
Get all movies with filtering and sorting
- **Query Parameters**:
  - `category`: Filter by category name
  - `search`: Search in title and description
  - `sort`: Sort by "title", "rating", or "date"
- **Response**: Array of movies with category information

### GET /movies/:id
Get single movie by ID
- **Response**: Movie data with ratings and category

### POST /movies
Upload new movie (Protected)
- **Headers**: Authorization token required
- **Body**: Form data with image file
- **Fields**: title, description, category, releaseDate, image

### GET /movies/categories
Get all available categories
- **Response**: Array of categories

## Movie Recommendation Routes (NEW! 🎯)

### GET /movies/recommendations
Get personalized movie recommendations based on user ratings (Protected)
- **Headers**: Authorization token required
- **Query Parameters**:
  - `limit`: Number of recommendations (default: 10)
- **Response**: Personalized movie recommendations with scores
- **Method**: Content-based filtering using user's high-rated movies

### GET /movies/recommendations/advanced
Get advanced recommendations using collaborative filtering (Protected)
- **Headers**: Authorization token required
- **Query Parameters**:
  - `limit`: Number of recommendations (default: 10)
- **Response**: Recommendations based on similar users' preferences
- **Method**: Collaborative filtering with user similarity scoring

### GET /movies/recommendations/category
Get category-based recommendations (Protected)
- **Headers**: Authorization token required
- **Query Parameters**:
  - `limit`: Number of recommendations (default: 10)
- **Response**: Recommendations focusing on under-explored categories
- **Method**: Category analysis with diversity promotion

### GET /movies/recommendations/comprehensive
Get comprehensive recommendations combining all methods (Protected)
- **Headers**: Authorization token required
- **Query Parameters**:
  - `limit`: Number of recommendations (default: 15)
- **Response**: Best recommendations from all three methods combined
- **Method**: Hybrid approach with deduplication and scoring

## Rating Routes

### POST /movies/:id/rate
Rate a movie (Protected)
- **Headers**: Authorization token required
- **Body**: `{ "rating": number(1-5) }`
- **Response**: Rating confirmation

### GET /movies/:id/ratings
Get all ratings for a movie
- **Response**: Array of ratings with user information

### GET /movies/:id/my-rating
Get current user's rating for a movie (Protected)
- **Headers**: Authorization token required
- **Response**: User's rating data

## Recommendation Algorithm Details

### 1. Basic Recommendations (`/recommendations`)
- Analyzes user's high-rated movies (4-5 stars)
- Finds movies in similar categories
- Calculates recommendation score based on:
  - 60% weight to average rating
  - 30% bonus for high ratings (4+ stars)
  - 10% bonus for number of ratings

### 2. Advanced Recommendations (`/recommendations/advanced`)
- Finds users with similar rating patterns
- Calculates user similarity using rating correlation
- Recommends movies that similar users rated highly
- Scoring considers:
  - 50% weight to similar users' average rating
  - 30% weight to number of similar users who rated
  - 20% weight to overall movie rating

### 3. Category-Based Recommendations (`/recommendations/category`)
- Analyzes user's category preferences
- Identifies under-explored categories
- Promotes diversity in recommendations
- Scoring considers:
  - 70% weight to average rating
  - 10% weight to number of ratings
  - 20% bonus for high-rated movies

### 4. Comprehensive Recommendations (`/recommendations/comprehensive`)
- Combines all three methods
- Deduplicates results
- Provides method statistics
- Fallback to basic method if others fail

## Error Responses

All endpoints return consistent error format:
```json
{
  "status": "error",
  "message": "Error description",
  "statusCode": 400
}
```

## Success Responses

All endpoints return consistent success format:
```json
{
  "status": "success",
  "results": 10,
  "data": { ... }
}
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Login/Signup: 5 requests per 15 minutes

## Testing

Use the provided `test-recommendations.js` file to test the recommendation APIs:
```bash
node test-recommendations.js
```

Make sure to:
1. Start your backend server
2. Create a test user account
3. Rate some movies to generate recommendation data
4. Update the test credentials in the file
