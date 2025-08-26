import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;
  @Prop({
    required: [true, 'User must have a name'],
    trim: true,
    maxlength: [40, 'Name must be less than 40 characters'],
    minlength: [3, 'Name must be at least 3 characters'],
  })
  name: string;

  @Prop({
    required: [true, 'User must have an email'],
    unique: true,
    lowercase: true,
  })
  email: string;

  @Prop({
    required: [true, 'User must have a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // hide password by default
  })
  password: string;

  @Prop({
    required: [true, 'Please confirm your password'],
  })
  confirmPassword: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({
    default:
      'https://res.cloudinary.com/dujmvhjyt/image/upload/v1755785753/users/v1rron4l9ebzo2cwlr3x.jpg',
  })
  profileImage?: string;

  @Prop()
  dateOfBirth?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);


UserSchema.methods.correctPassword = async function(
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Middleware: hash password before saving
UserSchema.pre('save', async function (next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  // Hash password
  this.password = await bcrypt.hash(this.password, 12);

  // Delete confirmPassword field (we don't want it in DB)
  (this as any).confirmPassword = undefined;

  next();
});
