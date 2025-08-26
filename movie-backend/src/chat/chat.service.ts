import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private usersService: UsersService,
  ) {}

  async createConversation(userId: string, createConversationDto: CreateConversationDto): Promise<Conversation> {
    const { participantId } = createConversationDto;

    // Check if both users exist
    const [user, participant] = await Promise.all([
      this.usersService.findById(userId),
      this.usersService.findById(participantId),
    ]);

    if (!user || !participant) {
      throw new NotFoundException('One or both users not found');
    }

    // Check if conversation already exists
    const existingConversation = await this.conversationModel.findOne({
      participants: { $all: [userId, participantId] },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversation = new this.conversationModel({
      participants: [userId, participantId],
      isActive: true,
      lastActivity: new Date(),
    });

    return await conversation.save();
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'name email profileImage')
      .populate('lastMessage')
      .sort({ lastActivity: -1 })
      .exec();

    return conversations;
  }

  async getConversation(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findOne({
        _id: conversationId,
        participants: userId,
      })
      .populate('participants', 'name email profileImage')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  async sendMessage(conversationId: string, senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    // Verify conversation exists and user is participant
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: senderId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Create message
    const message = new this.messageModel({
      conversationId,
      senderId,
      ...createMessageDto,
    });

    const savedMessage = await message.save();

    // Update conversation last message and activity
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      lastMessage: savedMessage._id,
      lastActivity: new Date(),
    });

    return savedMessage;
  }

  async getMessages(conversationId: string, userId: string, limit = 50, offset = 0): Promise<Message[]> {
    // Verify user has access to conversation
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    const messages = await this.messageModel
      .find({ conversationId })
      .populate('senderId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    return messages.reverse(); // Return in chronological order
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageModel.findOne({
      _id: messageId,
      senderId: { $ne: userId }, // Only mark messages from others as read
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    message.readAt = new Date();
    return await message.save();
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageModel.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageModel.countDocuments({
      senderId: { $ne: userId },
      isRead: false,
      conversationId: {
        $in: await this.conversationModel
          .find({ participants: userId })
          .distinct('_id'),
      },
    });
  }

  async searchUsers(query: string, currentUserId: string): Promise<any[]> {
    const users = await this.usersService.searchUsers(query);
    return users.filter(user => user._id.toString() !== currentUserId);
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationModel.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found or access denied');
    }

    // Soft delete by setting isActive to false
    await this.conversationModel.findByIdAndUpdate(conversationId, {
      isActive: false,
    });
  }
}
