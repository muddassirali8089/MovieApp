import Rating from "../models/rating.model.js";
import Movie from "../models/movie.model.js";
import catchAsync from "./catchAsync.js";
import AppError from "../utils/AppError.js";

// @desc   Rate a movie
// @route  POST /api/v1/movies/:id/rate
// @access Private
export const rateMovie = catchAsync(async (req, res, next) => {
  const { rating } = req.body;
  const movieId = req.params.id;
  const userId = req.user._id;

  // Validation
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError("Rating must be between 1 and 5", 400));
  }

  // Check if movie exists
  const movie = await Movie.findById(movieId);
  if (!movie) {
    return next(new AppError("Movie not found", 404));
  }

  // Check if user has already rated this movie
  const existingRating = await Rating.findOne({ user: userId, movie: movieId });
  
  if (existingRating) {
    // Update existing rating
    existingRating.rating = rating;
    await existingRating.save();
  } else {
    // Create new rating
    await Rating.create({
      user: userId,
      movie: movieId,
      rating,
    });
  }

  // Update movie's ratings array and average rating
  const allRatings = await Rating.find({ movie: movieId });
  const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = allRatings.length > 0 ? totalRating / allRatings.length : 0;

  // Update movie with new rating data
  movie.ratings = allRatings.map(r => ({
    user: r.user,
    rating: r.rating
  }));
  movie.averageRating = Math.round(averageRating * 10) / 10;
  await movie.save();

  res.status(200).json({
    status: "success",
    data: {
      rating: existingRating ? existingRating : { user: userId, movie: movieId, rating },
      movie: {
        id: movie._id,
        title: movie.title,
        averageRating: movie.averageRating,
        totalRatings: allRatings.length
      }
    },
  });
});

// @desc   Get all movies rated by the current user
// @route  GET /api/v1/users/my-ratings
// @access Private
export const getMyRatings = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  const ratings = await Rating.find({ user: userId })
    .populate({
      path: 'movie',
      select: 'title posterImage genre releaseYear averageRating'
    })
    .sort({ createdAt: -1 }) // Most recent first
    .select('-__v');

  res.status(200).json({
    status: "success",
    results: ratings.length,
    data: { ratings },
  });
});

// @desc   Get user's rating for a specific movie
// @route  GET /api/v1/movies/:id/my-rating
// @access Private
export const getMyRating = catchAsync(async (req, res, next) => {

  console.log("my ratings call sure called");
  
  const movieId = req.params.id;
  const userId = req.user._id;

  const rating = await Rating.findOne({ user: userId, movie: movieId });

  res.status(200).json({
    status: "success",
    data: {
      rating: rating ? rating.rating : null,
      hasRated: !!rating
    },
  });
});

// @desc   Get all ratings for a movie
// @route  GET /api/v1/movies/:id/ratings
// @access Public
export const getMovieRatings = catchAsync(async (req, res, next) => {
  const movieId = req.params.id;

  const ratings = await Rating.find({ movie: movieId })
    .populate("user", "name profileImage")
    .select("-__v");

  res.status(200).json({
    status: "success",
    results: ratings.length,
    data: { ratings },
  });
});

