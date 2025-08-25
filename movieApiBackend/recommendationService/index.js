import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL 
    : ["http://localhost:3000", "http://localhost:7000"],
  credentials: true
}));

app.use(express.json({ limit: "10kb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Main recommendation endpoint - this is what your main API will call
app.post("/get-recommendations", async (req, res) => {
  try {
    const { userId, userRatings, movies, categories, limit = 10 } = req.body;

    if (!userId || !userRatings || !movies || !categories) {
      return res.status(400).json({
        status: "error",
        message: "Missing required data: userId, userRatings, movies, categories"
      });
    }

    console.log(`🎯 Processing recommendations for user ${userId}`);

    // Step 1: Analyze user preferences (movies they rated 4-5 stars)
    const userHighRatings = userRatings.filter(r => r.rating >= 4);
    const userRatedMovieIds = userRatings.map(r => r.movieId);

    if (userHighRatings.length === 0) {
      // If user has no high ratings, return popular movies (excluding rated ones)
      const popularMovies = getPopularMovies(movies, userRatedMovieIds, limit);
      return res.json({
        status: "success",
        message: "No personal ratings found. Showing popular movies instead.",
        results: popularMovies.length,
        data: { recommendations: popularMovies }
      });
    }

    // Step 2: Extract categories user likes
    const userLikedCategories = [...new Set(
      userHighRatings.map(r => {
        const movie = movies.find(m => m._id === r.movieId);
        return movie ? movie.category : null;
      }).filter(Boolean)
    )];

    // Step 3: Find movies in similar categories that user hasn't rated
    let recommendations = getCategoryBasedRecommendations(
      movies, 
      userRatedMovieIds, 
      userLikedCategories, 
      limit
    );

    // Step 4: If not enough, add popular movies from other categories
    if (recommendations.length < limit) {
      const additionalMovies = getAdditionalRecommendations(
        movies, 
        userRatedMovieIds, 
        userLikedCategories, 
        limit - recommendations.length
      );
      recommendations.push(...additionalMovies);
    }

    // Final quality check: Filter out any movies with very low recommendation scores
    const highQualityRecommendations = recommendations.filter(movie => 
      movie.recommendationScore > 0.1
    );

    console.log(`✅ Generated ${highQualityRecommendations.length} recommendations for user ${userId}`);

    res.json({
      status: "success",
      results: highQualityRecommendations.length,
      data: { recommendations: highQualityRecommendations }
    });

  } catch (error) {
    console.error("❌ Recommendation service error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate recommendations",
      error: error.message
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "Recommendation service is running",
    timestamp: new Date().toISOString()
  });
});

// Helper functions for recommendation algorithm (converted from your main API)
function getPopularMovies(movies, excludeIds, limit) {
  return movies
    .filter(m => !excludeIds.includes(m._id))
    .filter(m => m.averageRating >= 3.5) // Only movies with decent ratings
    .map(m => ({
      _id: m._id,
      title: m.title,
      description: m.description,
      image: m.image,
      averageRating: m.averageRating,
      releaseDate: m.releaseDate,
      category: m.categoryName || 'Unknown Category',
      recommendationScore: m.averageRating + (m.ratings && m.ratings.length >= 3 ? 0.5 : 0)
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

function getCategoryBasedRecommendations(movies, excludeIds, likedCategories, limit) {
  return movies
    .filter(m => !excludeIds.includes(m._id) && likedCategories.includes(m.category))
    .map(m => ({
      _id: m._id,
      title: m.title,
      description: m.description,
      image: m.image,
      averageRating: m.averageRating,
      releaseDate: m.releaseDate,
      category: m.categoryName || 'Unknown Category',
      recommendationScore: calculateRecommendationScore(m)
    }))
    .filter(m => m.recommendationScore > 0.1)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

function getAdditionalRecommendations(movies, excludeIds, excludeCategories, limit) {
  return movies
    .filter(m => !excludeIds.includes(m._id) && !excludeCategories.includes(m.category))
    .filter(m => m.averageRating >= 3.0) // Minimum rating threshold for additional movies
    .map(m => ({
      _id: m._id,
      title: m.title,
      description: m.description,
      image: m.image,
      averageRating: m.averageRating,
      releaseDate: m.releaseDate,
      category: m.categoryName || 'Unknown Category',
      recommendationScore: m.averageRating + (m.ratings && m.ratings.length >= 2 ? 0.3 : 0)
    }))
    .filter(m => m.recommendationScore >= 3.0)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
}

function calculateRecommendationScore(movie) {
  return (
    (movie.averageRating * 0.6) + // 60% weight to rating
    (movie.averageRating >= 4 ? 0.3 : 0) + // Bonus for high ratings
    (movie.ratings && movie.ratings.length >= 5 ? 0.1 : 0) // Bonus for movies with 5+ ratings
  );
}

const PORT = process.env.RECOMMENDATION_SERVICE_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎯 Recommendation Microservice running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Ready to receive recommendation requests from main API`);
  console.log(`📝 Endpoint: POST http://localhost:${PORT}/get-recommendations`);
});
