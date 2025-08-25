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

      return this.appService.getRecommendations(request);
    } catch (error) {
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
