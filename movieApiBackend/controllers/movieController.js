import Movie from "../models/movie.model.js";
import catchAsync from "./catchAsync.js";
import AppError from "../utils/AppError.js";

export const getMovies = catchAsync(async (req, res, next) => {
  // Fetch all movies
  const movies = await Movie.find();

  res.status(200).json({
    status: "success",
    results: movies.length,
    data: { movies },
  });
});


