import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UsersService } from '../users/users.service';
import { ChatEvents } from './chat.events';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    private usersService: UsersService,
    private chatEvents: ChatEvents,
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
      // Return populated conversation if it already exists
      const populatedExisting = await this.conversationModel
        .findById(existingConversation._id)
        .populate('participants', 'name email profileImage')
        .exec();
      
      if (!populatedExisting) {
        throw new NotFoundException('Failed to populate existing conversation');
      }
      
      console.log('✅ Existing conversation found with populated users:', populatedExisting);
      return populatedExisting;
    } 

    // Create new conversation
    const conversation = new this.conversationModel({
      participants: [userId, participantId],
      isActive: true,
      lastActivity: new Date(),
    });

    const savedConversation = await conversation.save();
    
    // Return populated conversation immediately
    const populatedConversation = await this.conversationModel
      .findById(savedConversation._id)
      .populate('participants', 'name email profileImage')
      .exec();

    if (!populatedConversation) {
      throw new NotFoundException('Failed to populate new conversation');
    }

    console.log('✅ New conversation created with populated users:', populatedConversation);
    
    // Don't emit any events when creating conversation - only when messages are sent
    // This prevents duplicate displays and premature notifications
    
    return populatedConversation;
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

    // Get the populated conversation for real-time updates
    const populatedConversation = await this.conversationModel
      .findById(conversationId)
      .populate('participants', 'name email profileImage')
      .populate('lastMessage')
      .exec();

    if (!populatedConversation) {
      throw new NotFoundException('Failed to populate conversation for real-time updates');
    }

    // Emit event for real-time updates
    console.log('📡 Emitting new_message event for conversation:', conversationId)
    this.chatEvents.emitNewMessage(conversationId, savedMessage);
    
    // Emit conversation update for ALL participants - this ensures receivers get the conversation
    // even if they don't have it in their list yet
    console.log('📡 Emitting conversation_updated event for conversation:', conversationId)
    console.log('👥 Participants in conversation:', populatedConversation.participants.map(p => ({ id: p._id, name: (p as any).name })))
    console.log('🔧 About to call chatEvents.emitConversationUpdate...')
    this.chatEvents.emitConversationUpdate(conversationId, populatedConversation);
    console.log('✅ chatEvents.emitConversationUpdate called successfully')

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
    const updatedMessage = await message.save();

    // Emit event for real-time updates
    this.chatEvents.emitMessageRead(
      updatedMessage.conversationId.toString(),
      messageId,
      userId,
    );

    return updatedMessage;
  }

  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    console.log(`🔍 Marking conversation ${conversationId} as read for user ${userId}`);
    
    // First, find all unread messages in this conversation from other users
    const unreadMessages = await this.messageModel.find({
      conversationId,
      senderId: { $ne: userId },
      isRead: false,
    });
    
    console.log(`📝 Found ${unreadMessages.length} unread messages to mark as read`);
    
    if (unreadMessages.length > 0) {
      // Update all unread messages
      const result = await this.messageModel.updateMany(
        {
          conversationId,
          senderId: { $ne: userId },
          isRead: false,
        },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
      );
      
      console.log(`✅ Updated ${result.modifiedCount} messages as read`);
      
      // Emit events for each message that was marked as read
      for (const message of unreadMessages) {
        // Use type assertion to safely access _id
        const messageId = (message as any)._id?.toString();
        if (messageId) {
          this.chatEvents.emitMessageRead(
            conversationId,
            messageId,
            userId,
          );
        }
      }
    } else {
      console.log(`ℹ️ No unread messages found in conversation ${conversationId}`);
    }
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

  async getUserById(userId: string): Promise<any> {
    return this.usersService.findById(userId);
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
