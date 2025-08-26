import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {
  RecommendationService,
  RecommendationRequest,
} from './recommendation.service';
import { RatingsService } from '../ratings/ratings.service';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    private readonly recommendationService: RecommendationService,
    private readonly ratingsService: RatingsService,
  ) {}

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    const createdMovie = new this.movieModel(createMovieDto);
    return createdMovie.save();
  }

  async findAll(query: any = {}): Promise<Movie[]> {
    const { search, category, sort } = query;

    const filter: any = {};

    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // default sort
    if (sort === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    return this.movieModel
      .find(filter)
      .populate('category', 'name')
      .sort(sortOption)
      .exec();
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.movieModel
      .findById(id)
      .populate('category', 'name')
      .exec();

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    const updatedMovie = await this.movieModel
      .findByIdAndUpdate(id, updateMovieDto, { new: true })
      .populate('category', 'name')
      .exec();

    if (!updatedMovie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return updatedMovie;
  }

  async remove(id: string): Promise<Movie> {
    const deletedMovie = await this.movieModel.findByIdAndDelete(id).exec();
    if (!deletedMovie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return deletedMovie;
  }

  async getRecommendations(userId: string): Promise<any> {
    try {
      // Get all movies
      const movies: MovieDocument[] = await this.movieModel
        .find()
        .populate('category', 'name')
        .exec();

      // Get user ratings
      const userRatings = await this.ratingsService.findByUser(userId);

      // Prepare request for microservice
      const request: RecommendationRequest = {
        userId,
        userRatings: userRatings.map((rating) => ({
          movieId: (rating.movie as any)._id || rating.movie.toString(),
          rating: rating.rating,
        })),
        movies: movies.map((movie) => ({
          _id: (movie._id as any).toString(),
          title: movie.title,
          description: movie.description || '',
          image: movie.image,
          averageRating: movie.averageRating || 0,
          releaseDate: movie.releaseDate?.toISOString() || '',
          category: (movie.category as any)?.name || 'Unknown',
          ratings: movie.ratings || [],
        })),
        limit: 10,
      };

      // Debug: Log what we're sending to microservice
      console.log('🔍 DEBUG: User ratings being sent to microservice:');
      console.log('User ID:', userId);
      console.log('User Ratings:', JSON.stringify(request.userRatings, null, 2));
      console.log('Movies count:', request.movies.length);
      console.log('Sample movie:', request.movies[0]);

      // Call microservice and return its response
      return await this.recommendationService.getRecommendations(request);
    } catch (error) {
      // If microservice fails, return error response
      console.error('❌ Recommendation microservice failed:', error);
      return {
        status: 'error',
        message: 'Recommendation service unavailable',
        error: error.message,
        data: { recommendations: [] },
        results: 0,
      };
    }
  }
}
