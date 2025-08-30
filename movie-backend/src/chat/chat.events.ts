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

  emitConversationUpdate(conversationId: string, conversation: any) {
    console.log('📡 ChatEvents: Emitting chat.conversation.updated for:', conversationId)
    console.log('📡 ChatEvents: Event payload:', { conversationId, conversation })
    this.eventEmitter.emit('chat.conversation.updated', { conversationId, conversation });
    console.log('✅ ChatEvents: chat.conversation.updated event emitted successfully')
  }
}
