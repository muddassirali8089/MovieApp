# 🎯 Movie Recommendation Microservice

A simple NestJS microservice that provides movie recommendations based on user ratings.

## 🚀 Features

- **Simple Logic**: Excludes movies rated below 3 stars by the user
- **User Rating Tracking**: Keeps track of what movies users don't like
- **Quality Filter**: Only recommends movies with decent ratings (>= 3.5)
- **Independent Service**: Runs on port 5000, separate from main API

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Get Recommendations
```
POST /recommendations
```

**Request Body:**
```json
{
  "userId": "optional_user_id",
  "userRatings": [
    {
      "movieId": "movie_id_1",
      "rating": 4
    },
    {
      "movieId": "movie_id_2", 
      "rating": 2
    },
    {
      "movieId": "movie_id_3", 
      "rating": 3
    }
  ],
  "movies": [
    {
      "_id": "movie_id",
      "title": "Movie Title",
      "description": "Movie description",
      "image": "image_url",
      "averageRating": 4.2,
      "releaseDate": "2023-01-01",
      "category": "Action",
      "ratings": []
    }
  ],
  "limit": 10
}
```

**Note**: The service excludes movies you rated 1 or 2 stars (below 3 stars) from recommendations.

**Response:**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "recommendations": [
                        {
                    "_id": "movie_id",
                    "title": "Movie Title",
                    "description": "Movie description", 
                    "image": "image_url",
                    "averageRating": 4.2,
                    "releaseDate": "2023-01-01",
                    "category": "Action",
                    "recommendationScore": 4.7
                  }
    ]
  }
}
```

## 🏃‍♂️ Running the Service

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 🔗 Integration

This microservice runs on **port 5000** and can be called from your main NestJS backend:

```typescript
// In your main backend
const response = await fetch('http://localhost:5000/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_id',
    userRatings: userRatings,
    movies: allMovies,
    limit: 10
  })
});
```

## 🎯 How It Works

1. **User Rating Check**: Checks if user has rated any movies below 3 stars
2. **Exclusion Logic**: Excludes movies rated 1 or 2 stars from recommendations
3. **Quality Filter**: Only recommends movies with average rating >= 3.5
4. **Popular Movies**: Returns popular movies that user hasn't rated poorly

## 🌟 Simple & Effective

- No database dependencies
- Simple exclusion logic
- User rating tracking
- Perfect for microservice architecture
