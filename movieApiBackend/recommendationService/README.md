# Movie Recommendation Microservice

This is a microservice that handles movie recommendations separately from the main Movie API.

## 🚀 How It Works

### Architecture Flow:
```
User → Main API → Recommendation Microservice → Main API → User
```

1. **User** requests recommendations from main API (`GET /api/v1/movies/recommendations`)
2. **Main API** collects user data and calls the microservice
3. **Microservice** runs the recommendation algorithm and returns results
4. **Main API** receives results and sends them back to the user

### API Endpoints

#### POST `/get-recommendations`
**Request Body:**
```json
{
  "userId": "user123",
  "userRatings": [
    {
      "movieId": "movie456",
      "rating": 5
    }
  ],
  "movies": [
    {
      "_id": "movie456",
      "title": "Movie Title",
      "description": "Movie description",
      "image": "image_url",
      "averageRating": 4.2,
      "releaseDate": "2023-01-01",
      "category": "category_id",
      "categoryName": "Action",
      "ratings": []
    }
  ],
  "categories": [
    {
      "_id": "category123",
      "name": "Action"
    }
  ],
  "limit": 10
}
```

**Response:**
```json
{
  "status": "success",
  "results": 10,
  "data": {
    "recommendations": [
      {
        "_id": "movie789",
        "title": "Recommended Movie",
        "description": "Description",
        "image": "image_url",
        "averageRating": 4.5,
        "releaseDate": "2023-01-01",
        "category": "Action",
        "recommendationScore": 4.2
      }
    ]
  }
}
```

#### GET `/health`
Health check endpoint to verify the service is running.

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the service:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

3. **Environment Variables:**
   ```env
   RECOMMENDATION_SERVICE_PORT=5000
   NODE_ENV=development
   ```

## 🔧 Configuration

The service runs on port 5000 by default. You can change this by setting the `RECOMMENDATION_SERVICE_PORT` environment variable.

## 📊 Recommendation Algorithm

The microservice uses a sophisticated algorithm that:

1. **Analyzes user preferences** based on high ratings (4-5 stars)
2. **Identifies favorite categories** from highly-rated movies
3. **Recommends similar movies** in preferred categories
4. **Falls back to popular movies** if needed
5. **Calculates recommendation scores** using multiple factors:
   - 60% weight to average rating
   - 30% bonus for high ratings (4+ stars)
   - 10% bonus for movies with 5+ ratings

## 🔗 Integration with Main API

The main API calls this microservice when a user requests recommendations. If the microservice is unavailable, the main API falls back to showing popular movies.

## 🧪 Testing

Test the microservice:
```bash
# Health check
curl http://localhost:5000/health

# Test recommendations
curl -X POST http://localhost:5000/get-recommendations \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","userRatings":[],"movies":[],"categories":[],"limit":5}'
```

## 📝 Notes

- This microservice is stateless and doesn't store data
- All data is passed from the main API
- The service focuses solely on recommendation logic
- Built with security best practices (Helmet, CORS, etc.)
