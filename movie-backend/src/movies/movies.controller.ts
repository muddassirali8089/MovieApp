import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriesService } from '../categories/categories.service';
import { RatingsService } from '../ratings/ratings.service';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly categoriesService: CategoriesService,
    private readonly ratingsService: RatingsService,
  ) {}

  // Public routes (matching Node.js exactly)
  @Get()
  findAll(@Query() query: any) {
    return this.moviesService.findAll(query);
  }

  @Get('categories')
  getCategories() {
    return this.categoriesService.findAll();
  }

  // Protected routes (matching Node.js exactly)
  @Get('recommendations')
  @UseGuards(JwtAuthGuard)
  getRecommendations(@Request() req: RequestWithUser) {
    return this.moviesService.getRecommendations(req.user._id);
  }

  @Get('my-ratings')
  @UseGuards(JwtAuthGuard)
  getMyRatings(@Request() req: RequestWithUser) {
    return this.ratingsService.findByUser(req.user._id);
  }

  // Dynamic routes (matching Node.js exactly)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Get(':id/ratings')
  getMovieRatings(@Param('id') id: string) {
    return this.ratingsService.findByMovie(id);
  }

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  rateMovie(
    @Param('id') movieId: string,
    @Body() ratingData: { rating: number },
    @Request() req: RequestWithUser,
  ) {
    return this.ratingsService.create(
      { movie: movieId, rating: ratingData.rating },
      req.user._id,
    );
  }

  @Get(':id/my-rating')
  @UseGuards(JwtAuthGuard)
  getMyRating(@Param('id') movieId: string, @Request() req: RequestWithUser) {
    return this.ratingsService.getUserRatingForMovie(req.user._id, movieId);
  }

  // Admin routes (matching Node.js exactly)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }
}
