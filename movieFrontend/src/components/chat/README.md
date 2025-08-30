# Chat Components

This directory contains a modular, reusable chat system built with React best practices.

## Architecture

The chat system follows a clean separation of concerns:

- **Components**: Reusable UI components
- **Hooks**: Custom hooks for business logic
- **Utils**: Utility functions for common operations
- **Main Components**: High-level chat components that compose everything together

## Structure

```
chat/
├── components/           # Reusable UI components
│   ├── Avatar.jsx       # User avatar component
│   ├── Button.jsx       # Reusable button component
│   ├── ChatHeader.jsx   # Chat window header
│   ├── ConversationItem.jsx # Individual conversation item
│   ├── DeleteConfirmation.jsx # Delete confirmation modal
│   ├── LoadingSkeleton.jsx # Loading state component
│   ├── Message.jsx      # Individual message component
│   ├── MessageInput.jsx # Message input form
│   ├── SearchBar.jsx    # Search input component
│   ├── TypingIndicator.jsx # Typing indicator
│   └── index.js         # Component exports
├── hooks/               # Custom hooks
│   ├── useChat.js       # Chat window logic
│   ├── useChatSidebar.js # Sidebar logic
│   ├── useUserSearch.js # User search logic
│   └── index.js         # Hook exports
├── utils/               # Utility functions
│   └── chatUtils.js     # Chat-related utilities
├── ChatSidebar.jsx      # Main sidebar component
├── ChatWindow.jsx       # Main chat window component
├── UserSearch.jsx       # User search modal
├── chat.css             # Chat-specific styles
├── index.js             # Main exports
└── README.md            # This file
```

## Components

### Core Components

- **ChatSidebar**: Displays list of conversations
- **ChatWindow**: Main chat interface
- **UserSearch**: Modal for finding and starting new conversations

### Reusable Components

- **Avatar**: User profile image with fallback
- **Button**: Configurable button with variants
- **SearchBar**: Search input with icon
- **Message**: Individual chat message
- **MessageInput**: Message composition form
- **TypingIndicator**: Shows when users are typing
- **LoadingSkeleton**: Loading state placeholders

## Hooks

- **useChat**: Manages chat window state and logic
- **useChatSidebar**: Manages sidebar state and logic
- **useUserSearch**: Manages user search functionality

## Utilities

- **getOtherParticipant**: Gets the other participant in a conversation
- **formatLastActivity**: Formats conversation timestamps
- **formatMessageTime**: Formats message timestamps
- **hasUnreadMessages**: Checks if conversation has unread messages
- **filterConversations**: Filters conversations by search query

## Usage

```jsx
import { ChatSidebar, ChatWindow, UserSearch } from '@/components/chat'

// Use the components
<ChatSidebar 
  conversations={conversations}
  onConversationSelect={handleSelect}
  currentUser={user}
/>

<ChatWindow 
  conversation={selectedConversation}
  currentUser={user}
  onMessageSent={handleMessageSent}
/>
```

## Benefits

1. **Separation of Concerns**: Logic is separated from UI components
2. **Reusability**: Components can be used across different parts of the app
3. **Maintainability**: Easy to modify individual components without affecting others
4. **Testability**: Logic in hooks can be easily unit tested
5. **Performance**: Components only re-render when necessary
6. **Consistency**: Consistent UI patterns across the chat system

## Styling

The chat system uses Tailwind CSS with custom CSS for specific chat functionality. The `chat.css` file contains styles for:

- Message layout and positioning
- Scrollbar customization
- Typing indicators
- Message animations
- Responsive design

## Best Practices

- All business logic is contained in custom hooks
- Components are pure and receive props for data and callbacks
- Utility functions are pure and easily testable
- Consistent naming conventions across all files
- Proper TypeScript-like prop validation
- Error boundaries and loading states
- Accessibility considerations
