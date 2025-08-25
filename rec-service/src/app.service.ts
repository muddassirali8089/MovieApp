import { Injectable, Logger } from '@nestjs/common';

export interface Movie {
  _id: string;
  title: string;
  description: string;
  image: string;
  averageRating: number;
  releaseDate: string;
  category: string;
  ratings?: any[];
}

export interface UserRating {
  movieId: string;
  rating: number;
}

export interface RecommendationRequest {
  userId?: string;
  userRatings?: UserRating[];
  movies: Movie[];
  limit?: number;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getHello(): string {
    return 'Hello from Recommendation Microservice!';
  }

  // Simple recommendation logic
  getRecommendations(request: RecommendationRequest) {
    const { userId, userRatings = [], movies, limit = 10 } = request;
    
    // Enhanced user debugging
    this.logger.log(`🔍 Generating movie recommendations for user: ${userId || 'Anonymous'}`);
    this.logger.log(`📊 Request details: ${movies.length} movies, ${userRatings.length} user ratings, limit: ${limit}`);
    
    if (userId) {
      this.logger.log(`👤 User ${userId} has rated ${userRatings.length} movies`);
      if (userRatings.length > 0) {
        const ratingSummary = userRatings.map(r => `${r.movieId}: ${r.rating}⭐`).join(', ');
        this.logger.log(`📝 User ratings: ${ratingSummary}`);
      }
    }
    
    // Get movies user rated less than 3 stars (don't recommend these)
    const lowRatedMovieIds = userRatings
      .filter(r => r.rating < 3)
      .map(r => r.movieId);
    
    this.logger.log(`❌ Excluding ${lowRatedMovieIds.length} low-rated movies for user ${userId || 'Anonymous'}`);
    
    // Filter out low-rated movies and get popular ones
    const recommendations = movies
      .filter(movie => !lowRatedMovieIds.includes(movie._id))
      .filter(movie => movie.averageRating >= 3.5) // Only movies with decent ratings
      .map(movie => ({
        _id: movie._id,
        title: movie.title,
        description: movie.description,
        image: movie.image,
        averageRating: movie.averageRating,
        releaseDate: movie.releaseDate,
        category: movie.category,
        recommendationScore: movie.averageRating + ((movie.ratings && movie.ratings.length >= 3) ? 0.5 : 0)
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, limit);
    
    this.logger.log(`✅ Generated ${recommendations.length} recommendations for user ${userId || 'Anonymous'}`);
    this.logger.log(`🎯 Top recommendation: ${recommendations[0]?.title || 'None'} (Score: ${recommendations[0]?.recommendationScore || 0})`);
    
    return {
      status: 'success',
      results: recommendations.length,
      data: { recommendations }
    };
  }
}
