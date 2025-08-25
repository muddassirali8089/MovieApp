import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MovieDocument = Movie & Document;

@Schema({ timestamps: true })
export class Movie {
  @Prop({
    required: [true, 'Movie must have a title'],
    unique: true,
    trim: true,
    minlength: [2, 'Movie title must be at least 2 characters'],
  })
  title: string;

  @Prop({
    trim: true,
    maxlength: [500, 'Description must not exceed 500 characters'],
  })
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Category',
    required: [true, 'Movie must belong to a category'],
  })
  category: Types.ObjectId;

  @Prop({
    default:
      'https://res.cloudinary.com/dujmvhjyt/image/upload/v1755821112/movies/ckeretpb1cievueuxvci.jpg',
    required: [true, 'Movie must have an image'],
  })
  image: string;

  @Prop()
  releaseDate?: Date;

  @Prop([
    {
      user: {
        type: Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: true,
      },
    },
  ])
  ratings?: Array<{
    user: Types.ObjectId;
    rating: number;
  }>;

  @Prop({
    min: 0,
    max: 5,
    default: 0,
  })
  averageRating?: number;
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

// Middleware to auto-update averageRating whenever ratings change
MovieSchema.pre('save', function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const avg =
      this.ratings.reduce((sum, r) => sum + r.rating, 0) / this.ratings.length;
    this.averageRating = Math.round(avg * 10) / 10; // round to 1 decimal
  } else {
    this.averageRating = 0;
  }
  next();
});
