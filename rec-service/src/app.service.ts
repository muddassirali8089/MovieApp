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

export interface RecommendationMovie extends Movie {
  recommendationScore: number;
  matchReason?: string;
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

    // SUPER SIMPLE: exclude movies rated below 3 stars
  getRecommendations(request: RecommendationRequest) {
    const { userId, userRatings = [], movies, limit = 10 } = request;

   

    // Find movies rated 1 or 2 stars - NEVER recommend these
    const badMovieIds = userRatings
      .filter(r => r.rating === 1 || r.rating === 2)
      .map(r => r.movieId);
    
    if (badMovieIds.length > 0) {
      const badMovies = badMovieIds.map(id => {
        const movie = movies.find(m => m._id === id);
        return movie?.title || id;
      });
     
    }

    // Simple: exclude bad movies, return good ones
    const goodMovies = movies
      .filter(movie => !badMovieIds.includes(movie._id)) // Remove 1-2 star rated movies
      .filter(movie => movie.averageRating >= 3.0) // Only decent movies
      .sort((a, b) => b.averageRating - a.averageRating) // Best first
      .slice(0, limit);

    

    return {
      status: 'success',
      results: goodMovies.length,
      data: { recommendations: goodMovies }
    };
  }


}
