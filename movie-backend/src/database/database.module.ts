import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import keyConfig from '../config/key';

@Module({
  imports: [
    MongooseModule.forRoot(keyConfig.uri, {
      // Optional: Add connection options for better stability
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }),
  ],
})
export class DatabaseModule {}
