export class CreateMovieDto {
  title: string;
  description?: string;
  category: string; // Category ID
  image?: string;
  releaseDate?: Date;
}
