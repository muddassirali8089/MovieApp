# 🎯 Movie Recommendation Microservice

A simple NestJS microservice that provides movie recommendations based on user ratings.

## 🚀 Features

- **Simple Logic**: Returns popular movies if no user ratings
- **Smart Filtering**: Excludes movies rated below 3 stars
- **Quality Filter**: Only recommends movies with average rating >= 3.5
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

1. **No Ratings**: Returns popular movies (rating >= 3.5)
2. **With Ratings**: Excludes movies rated < 3 stars
3. **Scoring**: Combines average rating + popularity bonus
4. **Sorting**: Returns top movies by recommendation score

## 🌟 Simple & Lightweight

- No database dependencies
- No complex algorithms
- Just smart filtering and sorting
- Perfect for microservice architecture
