import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { OnEvent } from '@nestjs/event-emitter';

interface AuthenticatedSocket extends Socket {
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token and get user info
      const user = await this.verifyToken(token);
      if (!user) {
        client.disconnect();
        return;
      }

      // Store user info in socket
      client.user = user;
      
      // Store connection mapping
      this.connectedUsers.set(user._id, client.id);
      
      console.log(`User ${user.name} connected: ${client.id}`);
      
      // Emit connection status to user
      client.emit('connected', { 
        message: 'Connected to chat server',
        user: { _id: user._id, name: user.name, email: user.email }
      });
      
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.connectedUsers.delete(client.user._id);
      console.log(`User ${client.user.name} disconnected: ${client.id}`);
    }
  }

  private async verifyToken(token: string) {
    try {
      // This is a simplified token verification
      // In production, you should use the same JWT verification logic
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'your-super-secret-jwt-key-here');
      
      // Get user from database
      const user = await this.chatService.getUserById(decoded.id);
      return user;
    } catch (error) {
      return null;
    }
  }

  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

    // Broadcast typing indicator to all connected users
    this.server.emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.user._id,
      userName: client.user.name,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.user) return;

    // Broadcast typing stop indicator
    this.server.emit('user_typing', {
      conversationId: data.conversationId,
      userId: client.user._id,
      userName: client.user.name,
      isTyping: false,
    });
  }

  // Event listeners for real-time updates
  @OnEvent('chat.message.sent')
  handleMessageSent(payload: { conversationId: string; message: any }) {
    console.log(`Broadcasting message for conversation ${payload.conversationId}:`, payload.message);
    this.server.emit('new_message', {
      conversationId: payload.conversationId,
      message: payload.message,
    });
  }

  @OnEvent('chat.message.read')
  handleMessageRead(payload: { conversationId: string; messageId: string; readBy: string }) {
    console.log(`Broadcasting message read for conversation ${payload.conversationId}:`, payload.messageId);
    this.server.emit('message_read', {
      conversationId: payload.conversationId,
      messageId: payload.messageId,
      readBy: payload.readBy,
    });
  }

  @OnEvent('chat.conversation.created')
  handleConversationCreated(payload: { conversationId: string; conversation: any }) {
    console.log(`Broadcasting new conversation:`, payload.conversationId);
    this.server.emit('new_conversation', {
      conversation: payload.conversation,
    });
  }

  @OnEvent('chat.conversation.updated')
  handleConversationUpdated(payload: { conversationId: string; conversation: any }) {
    console.log('🔄 Gateway: Received chat.conversation.updated event')
    console.log('🔄 Gateway: Broadcasting conversation update:', payload.conversationId);
    console.log('🔄 Gateway: Event payload:', payload);

    const participantIds = payload.conversation.participants.map(p => p._id.toString());
    console.log('👥 Gateway: Broadcasting to participants:', participantIds);

    // Broadcast to conversation room
    console.log('📡 Gateway: Broadcasting to conversation room:', payload.conversationId)
    this.server.to(payload.conversationId).emit('conversation_updated', {
      conversationId: payload.conversationId,
      conversation: payload.conversation,
    });

    // Also broadcast to individual user rooms to ensure all participants receive it
    participantIds.forEach(participantId => {
      const socketId = this.connectedUsers.get(participantId);
      if (socketId) {
        console.log(`📡 Gateway: Emitting conversation update to user ${participantId} via socket ${socketId}`);
        this.server.to(socketId).emit('conversation_updated', {
          conversationId: payload.conversationId,
          conversation: payload.conversation,
        });
      } else {
        console.log(`⚠️ Gateway: User ${participantId} is not connected, cannot send conversation update`);
      }
    });
    
    console.log('✅ Gateway: conversation_updated event broadcast completed');
  }

  // Method to broadcast new message to all connected users (kept for backward compatibility)
  async broadcastMessage(conversationId: string, message: any) {
    console.log(`Broadcasting message for conversation ${conversationId}:`, message);
    this.server.emit('new_message', {
      conversationId,
      message,
    });
  }

  // Method to notify user about new conversation
  async notifyNewConversation(userId: string, conversation: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('new_conversation', { conversation });
    }
  }

  // Method to notify user about message read status
  async notifyMessageRead(conversationId: string, messageId: string, readBy: string) {
    this.server.emit('message_read', {
      conversationId,
      messageId,
      readBy,
    });
  }
}
