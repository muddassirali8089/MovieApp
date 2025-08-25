import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({
    required: [true, 'Category must have a name'],
    unique: true,
    enum: {
      values: ['Action', 'Horror', 'Comedy', 'Animated'],
      message: 'Category must be Action, Horror, Comedy, or Animated',
    },
  })
  name: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
