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
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly microserviceUrl = 'http://localhost:5000';

  async getRecommendations(request: RecommendationRequest) {
    this.logger.log(`🔍 Calling recommendation microservice for user: ${request.userId || 'Anonymous'}`);
    
    try {
      const response = await fetch(`${this.microserviceUrl}/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Microservice responded with status: ${response.status}`);
      }

      const result = await response.json();
      this.logger.log(`✅ Microservice returned ${result.results} recommendations`);
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Error calling recommendation microservice: ${error.message}`);
      
      // Fallback: return popular movies if microservice fails
      this.logger.log('🔄 Falling back to local recommendation logic');
      return this.getFallbackRecommendations(request);
    }
  }

  private getFallbackRecommendations(request: RecommendationRequest) {
    const { userRatings = [], movies, limit = 10 } = request;
    
    // Simple fallback logic
    const lowRatedMovieIds = userRatings
      .filter(r => r.rating < 3)
      .map(r => r.movieId);
    
    const recommendations = movies
      .filter(movie => !lowRatedMovieIds.includes(movie._id))
      .filter(movie => movie.averageRating >= 3.5)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, limit)
      .map(movie => ({
        _id: movie._id,
        title: movie.title,
        description: movie.description,
        image: movie.image,
        averageRating: movie.averageRating,
        releaseDate: movie.releaseDate,
        category: movie.category,
        recommendationScore: movie.averageRating
      }));

    return {
      status: 'success',
      results: recommendations.length,
      data: { recommendations },
      message: 'Using fallback recommendations (microservice unavailable)'
    };
  }
}
