import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import type { RecommendationRequest } from './app.service';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'success',
      message: 'Recommendation service is healthy',
      timestamp: new Date().toISOString(),
      service: 'movie-recommendation-service'
    };
  }

  @Post('recommendations')
  getRecommendations(@Body() request: RecommendationRequest) {
    try {
      // Validate request
      if (!request.movies || !Array.isArray(request.movies)) {
        throw new HttpException(
          'Movies array is required',
          HttpStatus.BAD_REQUEST
        );
      }

      // Enhanced logging for debugging
      console.log('🔍 Microservice received request:');
      console.log(`   User ID: ${request.userId}`);
      console.log(`   Movies count: ${request.movies.length}`);
      console.log(`   User ratings count: ${request.userRatings?.length || 0}`);
      
      if (request.userRatings && request.userRatings.length > 0) {
        console.log('   User ratings:');
        request.userRatings.forEach(r => {
          console.log(`     Movie ID: ${r.movieId}, Rating: ${r.rating}⭐`);
        });
      }

      const result = this.appService.getRecommendations(request);
      
      // Log the result for debugging
      console.log('✅ Microservice returning result:');
      console.log(`   Status: ${result.status}`);
      console.log(`   Results count: ${result.results}`);
      if (result.data?.recommendations) {
        console.log('   Recommended movies:');
        result.data.recommendations.forEach((m: any) => {
          console.log(`     ${m.title} (Score: ${m.recommendationScore})`);
        });
      }
      
      return result;
    } catch (error) {
      console.error('❌ Microservice error:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to generate recommendations',
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
