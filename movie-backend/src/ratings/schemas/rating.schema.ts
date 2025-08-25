import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Movie',
    required: true,
  })
  movie: Types.ObjectId;

  @Prop({
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    required: [true, 'Rating is required'],
  })
  rating: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

// Prevent duplicate ratings
RatingSchema.index({ user: 1, movie: 1 }, { unique: true });
