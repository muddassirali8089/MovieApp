import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ChatEvents {
  constructor(private eventEmitter: EventEmitter2) {}

  emitNewMessage(conversationId: string, message: any) {
    this.eventEmitter.emit('chat.message.sent', { conversationId, message });
  }

  emitMessageRead(conversationId: string, messageId: string, readBy: string) {
    this.eventEmitter.emit('chat.message.read', { conversationId, messageId, readBy });
  }

  emitNewConversation(conversationId: string, conversation: any) {
    this.eventEmitter.emit('chat.conversation.created', { conversationId, conversation });
  }
}
