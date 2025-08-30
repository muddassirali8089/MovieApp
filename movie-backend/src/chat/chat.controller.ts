import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('conversations')
  @HttpCode(HttpStatus.CREATED)
  async createConversation(
    @Request() req,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const conversation = await this.chatService.createConversation(
      req.user._id,
      createConversationDto,
    );
    return {
      success: true,
      data: conversation,
      message: 'Conversation created successfully',
    };
  }

  @Get('conversations')
  async getConversations(@Request() req) {
    const conversations = await this.chatService.getConversations(req.user._id);
    return {
      success: true,
      data: conversations,
      message: 'Conversations retrieved successfully',
    };
  }

  @Get('conversations/:id')
  async getConversation(@Request() req, @Param('id') conversationId: string) {
    const conversation = await this.chatService.getConversation(
      conversationId,
      req.user._id,
    );
    return {
      success: true,
      data: conversation,
      message: 'Conversation retrieved successfully',
    };
  }

  @Post('conversations/:id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Request() req,
    @Param('id') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.chatService.sendMessage(
      conversationId,
      req.user._id,
      createMessageDto,
    );
    return {
      success: true,
      data: message,
      message: 'Message sent successfully',
    };
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @Request() req,
    @Param('id') conversationId: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    const messages = await this.chatService.getMessages(
      conversationId,
      req.user._id,
      parseInt(limit),
      parseInt(offset),
    );
    return {
      success: true,
      data: messages,
      message: 'Messages retrieved successfully',
    };
  }

  @Put('messages/:id/read')
  async markMessageAsRead(@Request() req, @Param('id') messageId: string) {
    const message = await this.chatService.markMessageAsRead(messageId, req.user._id);
    return {
      success: true,
      data: message,
      message: 'Message marked as read',
    };
  }

  @Put('conversations/:id/read')
  async markConversationAsRead(@Request() req, @Param('id') conversationId: string) {
    await this.chatService.markConversationAsRead(conversationId, req.user._id);
    return {
      success: true,
      message: 'All messages in conversation marked as read',
    };
  }

  @Post('conversations/:id/read-test')
  async markConversationAsReadTest(@Request() req, @Param('id') conversationId: string) {
    console.log(`🧪 Test endpoint called for conversation ${conversationId} by user ${req.user._id}`);
    await this.chatService.markConversationAsRead(conversationId, req.user._id);
    return {
      success: true,
      message: 'Test: All messages in conversation marked as read',
    };
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.chatService.getUnreadCount(req.user._id);
    return {
      success: true,
      data: { unreadCount: count },
      message: 'Unread count retrieved successfully',
    };
  }

  @Get('search-users')
  async searchUsers(@Request() req, @Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: [],
        message: 'Search query must be at least 2 characters',
      };
    }

    const users = await this.chatService.searchUsers(query, req.user._id);
    return {
      success: true,
      data: users,
      message: 'Users found successfully',
    };
  }

  @Delete('conversations/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteConversation(@Request() req, @Param('id') conversationId: string) {
    await this.chatService.deleteConversation(conversationId, req.user._id);
    return {
      success: true,
      message: 'Conversation deleted successfully',
    };
  }
}
