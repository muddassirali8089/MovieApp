import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createRatingDto: CreateRatingDto, @Request() req: any) {
    return this.ratingsService.create(createRatingDto, req.user._id);
  }

  @Get()
  findAll() {
    return this.ratingsService.findAll();
  }

  @Get('my-ratings')
  @UseGuards(JwtAuthGuard)
  findMyRatings(@Request() req: any) {
    return this.ratingsService.findByUser(req.user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ratingsService.findOne(id);
  }

  @Get('movie/:movieId')
  findByMovie(@Param('movieId') movieId: string) {
    return this.ratingsService.findByMovie(movieId);
  }

  @Get('movie/:movieId/my-rating')
  @UseGuards(JwtAuthGuard)
  getMyRatingForMovie(@Param('movieId') movieId: string, @Request() req: any) {
    return this.ratingsService.getUserRatingForMovie(req.user._id, movieId);
  }
}
