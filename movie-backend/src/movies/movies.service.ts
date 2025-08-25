import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from './schemas/movie.schema';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
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

  async getRecommendations(userId: string): Promise<Movie[]> {
    // Simple recommendation logic - get movies with high ratings
    return this.movieModel
      .find({ averageRating: { $gte: 4 } })
      .populate('category', 'name')
      .limit(10)
      .exec();
  }
}
