import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { Movie, MovieSchema } from './schemas/movie.schema';
import { CategoriesModule } from '../categories/categories.module';
import { RatingsModule } from '../ratings/ratings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }]),
    CategoriesModule,
    RatingsModule,
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
  exports: [MoviesService],
})
export class MoviesModule {}
