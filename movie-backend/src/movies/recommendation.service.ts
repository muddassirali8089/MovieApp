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
    this.logger.log(`📊 Request details: ${request.movies.length} movies, ${(request.userRatings || []).length} user ratings`);
    
    // Log user ratings for debugging
    if (request.userRatings && request.userRatings.length > 0) {
      const ratingSummary = request.userRatings.map((r) => `${r.movieId}: ${r.rating}⭐`).join(', ');
      this.logger.log(`📝 User ratings: ${ratingSummary}`);
    }
    
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
      
      // Log the actual recommendations for debugging
      if (result.data?.recommendations) {
        const movieTitles = result.data.recommendations.map((m: any) => m.title).join(', ');
        this.logger.log(`🎬 Recommended movies: ${movieTitles}`);
      }
      
      return result;
    } catch (error) {
      this.logger.error(`❌ Error calling recommendation microservice: ${error.message}`);
      throw error; // Re-throw to let the main service handle it
    }
  }
}
