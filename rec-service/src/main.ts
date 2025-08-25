import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for microservice communication
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:7000'],
    credentials: true,
  });
  
  const port = process.env.PORT || 5000;
  await app.listen(port);
  
  console.log(`🎯 Recommendation Microservice running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔗 Ready to receive recommendation requests from main API`);
  console.log(`📝 Endpoint: POST http://localhost:${port}/recommendations`);
}
bootstrap();
