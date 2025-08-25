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

  console.log("🔍 Recommendation service received request");
  
  try {
    const { userId, userRatings, movies, categories, limit = 10 } = req.body;

    // Debug logging for user details
    console.log(`👤 User ID: call the microservices ${userId}`);
    
    if (!userId || !userRatings || !movies || !categories) {
      console.log("❌ Missing required data in request");
      return res.status(400).json({
        status: "error",
        message: "Missing required data: userId, userRatings, movies, categories"
      });
    }

    // Step 1: Analyze user preferences (movies they rated 4-5 stars)
    const userHighRatings = userRatings.filter(r => r.rating >= 4);
    const userRatedMovieIds = userRatings.map(r => r.movieId);
    
    console.log(`🌟 User has ${userHighRatings.length} high ratings (4-5 stars)`);
    console.log(`📝 User has rated ${userRatedMovieIds.length} movies total`);

    if (userHighRatings.length === 0) {
      console.log("📊 No high ratings found, showing popular movies");
      // If user has no high ratings, return popular movies (excluding rated ones)
      const popularMovies = getPopularMovies(movies, userRatedMovieIds, limit);
      return res.json({
        status: "success",
        message: "No personal ratings found. Showing popular movies instead.",
        results: popularMovies.length,
        data: { recommendations: popularMovies }
      });
    }

    // Step 2: Get personalized recommendations based on user's 5-star ratings
    console.log("🎯 Generating personalized recommendations based on user's 5-star ratings");
    const personalizedRecommendations = getPersonalizedRecommendations(
      movies, 
      userRatings, 
      userRatedMovieIds, 
      limit
    );
    
    console.log(`✅ Generated ${personalizedRecommendations.length} personalized recommendations for user ${userId}`);

    res.json({
      status: "success",
      results: personalizedRecommendations.length,
      data: { recommendations: personalizedRecommendations }
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

// NEW: Personalized recommendation function based on user's 5-star ratings
function getPersonalizedRecommendations(movies, userRatings, excludeIds, limit) {
  // Get user's 5-star rated movies
  const userFiveStarMovies = userRatings
    .filter(r => r.rating === 5)
    .map(r => {
      const movie = movies.find(m => m._id === r.movieId);
      return movie;
    })
    .filter(Boolean);

  console.log(`🔥 User has ${userFiveStarMovies.length} movies rated 5 stars`);

  if (userFiveStarMovies.length === 0) {
    // Fallback to 4-star ratings if no 5-star ratings
    const userFourStarMovies = userRatings
      .filter(r => r.rating === 4)
      .map(r => {
        const movie = movies.find(m => m._id === r.movieId);
        return movie;
      })
      .filter(Boolean);
    
    console.log(`⭐ User has ${userFourStarMovies.length} movies rated 4 stars`);
    
    if (userFourStarMovies.length === 0) {
      return getPopularMovies(movies, excludeIds, limit);
    }
    
    return getRecommendationsBasedOnLikedMovies(movies, userFourStarMovies, excludeIds, limit);
  }

  return getRecommendationsBasedOnLikedMovies(movies, userFiveStarMovies, excludeIds, limit);
}

// NEW: Smart recommendation based on liked movies
function getRecommendationsBasedOnLikedMovies(movies, likedMovies, excludeIds, limit) {
  // Extract categories and characteristics from liked movies
  const likedCategories = [...new Set(likedMovies.map(m => m.category).filter(Boolean))];
  const likedGenres = [...new Set(likedMovies.map(m => m.genre).filter(Boolean))];
  
  console.log(`🎭 User likes categories: ${likedCategories.join(', ')}`);
  console.log(`🎬 User likes genres: ${likedGenres.join(', ')}`);

  // Score movies based on similarity to liked movies
  const scoredMovies = movies
    .filter(m => !excludeIds.includes(m._id))
    .map(movie => {
      let score = 0;
      
      // Category match (highest weight)
      if (likedCategories.includes(movie.category)) {
        score += 3.0;
      }
      
      // Genre match
      if (likedGenres.includes(movie.genre)) {
        score += 2.0;
      }
      
      // Rating quality
      score += movie.averageRating * 0.5;
      
      // Popularity bonus
      if (movie.ratings && movie.ratings.length >= 5) {
        score += 0.5;
      }
      
      // Recent release bonus
      if (movie.releaseDate) {
        const releaseYear = new Date(movie.releaseDate).getFullYear();
        const currentYear = new Date().getFullYear();
        if (currentYear - releaseYear <= 2) {
          score += 0.3;
        }
      }
      
      return {
        _id: movie._id,
        title: movie.title,
        description: movie.description,
        image: movie.image,
        averageRating: movie.averageRating,
        releaseDate: movie.releaseDate,
        category: movie.categoryName || movie.category || 'Unknown Category',
        genre: movie.genre || 'Unknown Genre',
        recommendationScore: score,
        matchReason: getMatchReason(movie, likedCategories, likedGenres)
      };
    })
    .filter(m => m.recommendationScore > 2.0) // Only show movies with decent scores
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);

  console.log(`🎯 Found ${scoredMovies.length} movies matching user preferences`);
  return scoredMovies;
}

// NEW: Helper to explain why a movie was recommended
function getMatchReason(movie, likedCategories, likedGenres) {
  const reasons = [];
  
  if (likedCategories.includes(movie.category)) {
    reasons.push(`Similar category: ${movie.category}`);
  }
  
  if (likedGenres.includes(movie.genre)) {
    reasons.push(`Similar genre: ${movie.genre}`);
  }
  
  if (movie.averageRating >= 4.0) {
    reasons.push(`High rating: ${movie.averageRating}/5`);
  }
  
  if (reasons.length === 0) {
    reasons.push("Popular and well-rated");
  }
  
  return reasons.join(", ");
}

const PORT = process.env.RECOMMENDATION_SERVICE_PORT || 5000;

app.listen(PORT, () => {
  console.log(`🎯 Recommendation Microservice running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Ready to receive recommendation requests from main API`);
  console.log(`📝 Endpoint: POST http://localhost:${PORT}/get-recommendations`);
});
