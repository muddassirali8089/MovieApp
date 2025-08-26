import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true })
  conversationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters'],
  })
  content: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: Date.now })
  readAt?: Date;

  @Prop({ default: 'text' })
  messageType: 'text' | 'image' | 'file';

  @Prop()
  mediaUrl?: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ isRead: 1 });
