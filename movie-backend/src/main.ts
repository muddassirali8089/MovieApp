/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix to match Node.js URLs exactly
  app.setGlobalPrefix('api/v1');
  
  // Add global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Enable CORS like Node.js version
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:3000',
    credentials: true,
  });
  
  const port = process.env.PORT || 7000;
  await app.listen(port);
  console.log(`NestJS App running on port ${port}...`);
  console.log(`API Base URL: http://localhost:${port}/api/v1`);
}
bootstrap();
