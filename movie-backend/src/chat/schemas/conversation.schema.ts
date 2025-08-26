import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'User', required: true }],
    validate: {
      validator: function(participants: Types.ObjectId[]) {
        return participants.length === 2;
      },
      message: 'Conversation must have exactly 2 participants',
    },
  })
  participants: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessage?: Types.ObjectId;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ type: Date, default: Date.now })
  lastActivity: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// Index for efficient querying
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastActivity: -1 });
