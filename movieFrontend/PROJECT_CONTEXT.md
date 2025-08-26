# MovieZone Application - Project Context

## 🎬 **Project Overview**
MovieZone is a full-stack movie recommendation and chat application built with modern technologies. Users can browse movies, rate them, get personalized recommendations, and chat with other users in real-time.

## 🏗️ **Architecture**

### **Backend (NestJS)**
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with Passport.js
- **Real-time**: Socket.IO for chat functionality
- **File Upload**: Cloudinary for image storage
- **Port**: 7000

### **Frontend (Next.js)**
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Port**: 3000

## 🔐 **Authentication System**
- JWT-based authentication with 90-day expiry
- Protected routes using JwtAuthGuard
- User sessions managed via localStorage
- Automatic token validation and refresh

## 📱 **Core Features**

### **1. Movie Management**
- Browse movies by categories
- Movie details with ratings and reviews
- Search and filter functionality
- Movie recommendations based on user preferences

### **2. User Rating System**
- 5-star rating system
- Personalized movie recommendations
- Rating history tracking
- Collaborative filtering algorithm

### **3. Real-Time Chat System**
- **Socket.IO Integration**: Real-time messaging
- **Conversation Management**: Create, join, and manage chat conversations
- **User Search**: Find and start conversations with other users
- **Typing Indicators**: Real-time typing status
- **Read Receipts**: Message read status tracking
- **Unread Counts**: Track unread messages per conversation

### **4. User Profiles**
- Profile information management
- Profile picture upload via Cloudinary
- Rating history display
- Personalized recommendations

## 🗄️ **Database Schema**

### **Users Collection**
```typescript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  address: String,
  dateOfBirth: Date,
  profileImage: String (Cloudinary URL),
  createdAt: Date,
  updatedAt: Date
}
```

### **Movies Collection**
```typescript
{
  _id: ObjectId,
  title: String,
  description: String,
  image: String,
  category: ObjectId (ref: Category),
  averageRating: Number,
  totalRatings: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### **Ratings Collection**
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  movieId: ObjectId (ref: Movie),
  rating: Number (1-5),
  createdAt: Date
}
```

### **Categories Collection**
```typescript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdAt: Date
}
```

### **Conversations Collection**
```typescript
{
  _id: ObjectId,
  participants: [ObjectId] (ref: User, exactly 2),
  lastMessage: ObjectId (ref: Message),
  isActive: Boolean,
  lastActivity: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Messages Collection**
```typescript
{
  _id: ObjectId,
  conversationId: ObjectId (ref: Conversation),
  senderId: ObjectId (ref: User),
  content: String,
  isRead: Boolean,
  readAt: Date,
  messageType: String ('text' | 'image' | 'file'),
  mediaUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔌 **API Endpoints**

### **Authentication**
- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/me` - Get current user profile

### **Movies**
- `GET /api/v1/movies` - Get all movies
- `GET /api/v1/movies/:id` - Get movie by ID
- `GET /api/v1/movies/recommendations` - Get personalized recommendations
- `POST /api/v1/movies/:id/rate` - Rate a movie
- `GET /api/v1/movies/:id/my-rating` - Get user's rating for a movie

### **Chat**
- `POST /api/v1/chat/conversations` - Create new conversation
- `GET /api/v1/chat/conversations` - Get user's conversations
- `GET /api/v1/chat/conversations/:id` - Get conversation by ID
- `POST /api/v1/chat/conversations/:id/messages` - Send message
- `GET /api/v1/chat/conversations/:id/messages` - Get conversation messages
- `PUT /api/v1/chat/messages/:id/read` - Mark message as read
- `PUT /api/v1/chat/conversations/:id/read` - Mark conversation as read
- `GET /api/v1/chat/unread-count` - Get unread message count
- `GET /api/v1/chat/search-users` - Search users for chat
- `DELETE /api/v1/chat/conversations/:id` - Delete conversation

### **User Management**
- `PATCH /api/v1/users/updateProfile` - Update user profile
- `PATCH /api/v1/users/updateProfileImage` - Update profile picture
- `GET /api/v1/users/my-ratings` - Get user's movie ratings

## 🌐 **Real-Time Socket Events**

### **Client to Server**
- `join_conversation` - Join a chat conversation
- `leave_conversation` - Leave a chat conversation
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### **Server to Client**
- `connected` - Connection established
- `joined_conversation` - Successfully joined conversation
- `left_conversation` - Successfully left conversation
- `new_message` - New message received
- `conversation_updated` - Conversation updated
- `new_conversation` - New conversation created
- `message_read` - Message read status updated
- `user_typing` - User typing indicator
- `error` - Error message

## 🎨 **UI Components**

### **Core Components**
- `Header` - Navigation with user menu and chat button
- `MovieCard` - Movie display with rating functionality
- `MovieRating` - Interactive star rating system
- `ChatSidebar` - Conversation list and management
- `ChatWindow` - Message display and input
- `UserSearch` - Modal for finding users to chat with

### **Pages**
- `/` - Home page with movie grid
- `/login` - User authentication
- `/movies` - Movie browsing and search
- `/movie/:id` - Individual movie details
- `/chat` - Chat interface
- `/profile` - User profile management
- `/recommendations` - Personalized movie suggestions
- `/my-ratings` - User's rating history

## 🔧 **Development Setup**

### **Backend Dependencies**
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/mongoose": "^10.0.0",
  "@nestjs/jwt": "^10.0.0",
  "@nestjs/passport": "^10.0.0",
  "@nestjs/websockets": "^10.0.0",
  "@nestjs/platform-socket.io": "^10.0.0",
  "socket.io": "^4.7.0",
  "mongoose": "^8.0.0",
  "bcryptjs": "^2.4.3",
  "passport-jwt": "^4.0.1",
  "cloudinary": "^1.41.0"
}
```

### **Frontend Dependencies**
```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "tailwindcss": "^3.3.0",
  "framer-motion": "^10.16.0",
  "lucide-react": "^0.292.0",
  "react-hot-toast": "^2.4.1",
  "socket.io-client": "^4.7.0"
}
```

## 🚀 **Deployment Considerations**

### **Environment Variables**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `FRONTEND_URL` - Frontend URL for CORS

### **Security Features**
- JWT token validation
- Password hashing with bcrypt
- CORS configuration
- Input validation with class-validator
- Rate limiting for authentication endpoints

## 📊 **Performance Optimizations**

### **Backend**
- Database indexing on frequently queried fields
- Mongoose population for related data
- Efficient aggregation pipelines for recommendations
- Socket.IO room-based broadcasting

### **Frontend**
- React.memo for expensive components
- Lazy loading for chat components
- Optimistic updates for better UX
- Efficient state management with Context API

## 🔮 **Future Enhancements**

### **Planned Features**
- Push notifications for chat messages
- File sharing in chat (images, documents)
- Group chat functionality
- Video call integration
- Advanced movie filtering and sorting
- Social features (follow users, share ratings)
- Mobile app development

### **Technical Improvements**
- Redis for session management
- Elasticsearch for advanced movie search
- GraphQL API for flexible data fetching
- Microservices architecture
- Docker containerization
- CI/CD pipeline automation

## 📝 **Development Notes**

### **Code Style**
- Consistent naming conventions
- TypeScript strict mode enabled
- ESLint and Prettier configuration
- Component-based architecture
- Custom hooks for reusable logic

### **Testing Strategy**
- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Component testing with React Testing Library

---

**Last Updated**: August 26, 2025
**Version**: 1.0.0
**Status**: Production Ready
**Maintainer**: Development Team
