import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
  ) {}

  async create(
    createRatingDto: CreateRatingDto,
    userId: string,
  ): Promise<Rating> {
    const { movie, rating } = createRatingDto;

    // Check if user already rated this movie
    const existingRating = await this.ratingModel.findOne({
      user: new Types.ObjectId(userId),
      movie: new Types.ObjectId(movie),
    });

    if (existingRating) {
      throw new BadRequestException('You have already rated this movie');
    }

    // Create rating
    const newRating = new this.ratingModel({
      user: new Types.ObjectId(userId),
      movie: new Types.ObjectId(movie),
      rating,
    });

    const savedRating = await newRating.save();

    return savedRating;
  }

  async findAll(): Promise<Rating[]> {
    return this.ratingModel
      .find()
      .populate('user', 'name email')
      .populate('movie', 'title image')
      .exec();
  }

  async findOne(id: string): Promise<Rating> {
    const rating = await this.ratingModel
      .findById(id)
      .populate('user', 'name email')
      .populate('movie', 'title image')
      .exec();

    if (!rating) {
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }
    return rating;
  }

  async findByUser(userId: string): Promise<Rating[]> {
    return this.ratingModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('movie', 'title image category')
      .exec();
  }

  async findByMovie(movieId: string): Promise<Rating[]> {
    return this.ratingModel
      .find({ movie: new Types.ObjectId(movieId) })
      .populate('user', 'name email')
      .exec();
  }

  async getUserRatingForMovie(
    userId: string,
    movieId: string,
  ): Promise<Rating | null> {
    return this.ratingModel
      .findOne({
        user: new Types.ObjectId(userId),
        movie: new Types.ObjectId(movieId),
      })
      .exec();
  }
}
