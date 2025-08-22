import Movie from "../models/movie.model.js";
import catchAsync from "./catchAsync.js";
import AppError from "../utils/AppError.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import Category from "../models/category.model.js";
import Rating from "../models/rating.model.js";
import mongoose from "mongoose";



export const uploadMovie = catchAsync(async (req, res, next) => {
  const { title, description, category, releaseDate } = req.body;

  // Validation
  if (!title || !category) {
    return next(new AppError("Title and category are required!", 400));
  }

  if (!req.file) {
    return next(new AppError("Please upload an image!", 400));
  }

  let categoryDoc = await Category.findOne({ name: category });
  
  // If category doesn't exist, create it automatically
  if (!categoryDoc) {
    try {
      categoryDoc = await Category.create({ name: category });
      console.log(`Created new category: ${category}`);
    } catch (err) {
      console.error("Error creating category:", err);
      return next(new AppError("Failed to create category: " + err.message, 500));
    }
  }

  let uploadedImage;

  try {
    // Upload to Cloudinary using stream
    uploadedImage = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "movies",
          resource_type: "image",
          format: "jpg", // Optional: convert all images to JPG
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    console.log("Uploaded image URL:", uploadedImage.secure_url);
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return next(new AppError("Cloudinary upload failed: " + err.message, 500));
  }

  // Create movie in DB
  const movie = await Movie.create({
    title,
    description,
    category: categoryDoc._id,
    releaseDate,
    image: uploadedImage.secure_url,
  });

  res.status(201).json({
    status: "success",
    data: { movie },
  });
});

export const getMovies = catchAsync(async (req, res, next) => {
  const { category, search, sort = "title" } = req.query;

  let filter = {};

  // Category filter
  if (category) {
    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) return next(new AppError("Category not found", 404));
    filter.category = categoryDoc._id;
  }

  // Search filter
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  // Build query with filters and populate category
  let query = Movie.find(filter).populate("category", "name");

  // Sorting
  if (sort === "rating") {
    query = query.sort({ averageRating: -1 });
  } else if (sort === "date") {
    query = query.sort({ releaseDate: -1 });
  } else {
    query = query.sort({ title: 1 });
  }

  const movies = await query;

  res.status(200).json({
    status: "success",
    results: movies.length,
    data: { movies },
  });
});


export const getMovie = catchAsync(async (req, res, next) => {
  const movie = await Movie.findById(req.params.id)
    .populate("category", "name")
    .populate("ratings.user", "name profileImage");

  if (!movie) {
    return next(new AppError("Movie not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { movie },
  });
});


export const getMovieRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  // Step 1: Get user's rating preferences (movies they rated 4-5 stars)
  const userHighRatings = await Rating.find({
    user: userId,
    rating: { $gte: 4 }
  }).populate('movie', 'category');

  // Step 1.5: Get ALL movies user has rated (to exclude them completely)
  const allUserRatings = await Rating.find({ user: userId });
  const userRatedMovieIds = allUserRatings.map(r => r.movie);

  if (userHighRatings.length === 0) {
    // If user has no high ratings, return popular movies (excluding rated ones)
    const popularMovies = await Movie.aggregate([
      {
        $match: { 
          _id: { $nin: userRatedMovieIds.map(id => new mongoose.Types.ObjectId(id)) },
          averageRating: { $gte: 3.5 } // Only movies with decent ratings
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $addFields: {
          categoryName: {
            $cond: {
              if: { $gt: [{ $size: '$categoryInfo' }, 0] },
              then: { $arrayElemAt: ['$categoryInfo.name', 0] },
              else: 'Unknown Category'
            }
          }
        }
      },
      {
        $addFields: {
          recommendationScore: {
            $add: [
              '$averageRating',
              { $cond: [{ $gte: [{ $size: '$ratings' }, 3] }, 0.5, 0] } // Bonus for movies with 3+ ratings
            ]
          }
        }
      },
      {
        $match: {
          // Filter out movies with very low recommendation scores
          recommendationScore: { $gte: 3.5 }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          averageRating: 1,
          releaseDate: 1,
          category: '$categoryName',
          recommendationScore: { $round: ['$recommendationScore', 2] }
        }
      },
      {
        $sort: { recommendationScore: -1 }
      },
      {
        $limit: limit
      }
    ]);

    return res.status(200).json({
      status: "success",
      message: "No personal ratings found. Showing popular movies instead.",
      results: popularMovies.length,
      data: { recommendations: popularMovies }
    });
  }

  // Step 2: Extract categories and movies the user likes
  const userLikedCategories = [...new Set(userHighRatings.map(r => r.movie.category._id.toString()))];
  
  // Step 3: Find movies in similar categories that user hasn't rated AT ALL
  const recommendations = await Movie.aggregate([
    {
      $match: {
        _id: { $nin: userRatedMovieIds.map(id => new mongoose.Types.ObjectId(id)) }, // Exclude ALL rated movies
        category: { $in: userLikedCategories.map(id => new mongoose.Types.ObjectId(id)) }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $addFields: {
        categoryName: {
          $cond: {
            if: { $gt: [{ $size: '$categoryInfo' }, 0] },
            then: { $arrayElemAt: ['$categoryInfo.name', 0] },
            else: 'Unknown Category'
          }
        }
      }
    },
    {
      $addFields: {
        // Calculate recommendation score based on multiple factors
        recommendationScore: {
          $add: [
            { $multiply: ['$averageRating', 0.6] }, // 60% weight to rating
            { $cond: [{ $gte: ['$averageRating', 4] }, 0.3, 0] }, // Bonus for high ratings
            { $cond: [{ $gte: [{ $size: '$ratings' }, 5] }, 0.1, 0] } // Bonus for movies with 5+ ratings
          ]
        }
      }
    },
    {
      $match: {
        // Filter out movies with 0 or very low recommendation scores
        recommendationScore: { $gt: 0.1 }
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        image: 1,
        averageRating: 1,
        releaseDate: 1,
        category: '$categoryName',
        recommendationScore: { $round: ['$recommendationScore', 2] }
      }
    },
    {
      $sort: { recommendationScore: -1 }
    },
    {
      $limit: limit
    }
  ]);

  // Step 4: If we don't have enough recommendations, add some popular movies from other categories
  if (recommendations.length < limit) {
    const additionalMovies = await Movie.aggregate([
      {
        $match: {
          _id: { $nin: userRatedMovieIds.map(id => new mongoose.Types.ObjectId(id)) },
          category: { $nin: userLikedCategories.map(id => new mongoose.Types.ObjectId(id)) }, // Different categories
          averageRating: { $gte: 3.0 } // Minimum rating threshold for additional movies
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $addFields: {
          categoryName: {
            $cond: {
              if: { $gt: [{ $size: '$categoryInfo' }, 0] },
              then: { $arrayElemAt: ['$categoryInfo.name', 0] },
              else: 'Unknown Category'
            }
          },
          recommendationScore: {
            $add: [
              '$averageRating',
              { $cond: [{ $gte: [{ $size: '$ratings' }, 2] }, 0.3, 0] } // Bonus for movies with 2+ ratings
            ]
          }
        }
      },
      {
        $match: {
          // Filter out movies with very low recommendation scores
          recommendationScore: { $gte: 3.0 }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          averageRating: 1,
          releaseDate: 1,
          category: '$categoryName',
          recommendationScore: { $round: ['$recommendationScore', 2] }
        }
      },
      {
        $sort: { recommendationScore: -1 }
      },
      {
        $limit: limit - recommendations.length
      }
    ]);

    recommendations.push(...additionalMovies);
  }

  // Final quality check: Filter out any movies with 0 or very low recommendation scores
  const highQualityRecommendations = recommendations.filter(movie => 
    movie.recommendationScore > 0.1
  );

  // Debug logging to check category data
  console.log('Recommendations sample:', highQualityRecommendations.slice(0, 2).map(m => ({
    title: m.title,
    category: m.category,
    categoryInfo: m.categoryInfo
  })));

  res.status(200).json({
    status: "success",
    results: highQualityRecommendations.length,
    data: { recommendations: highQualityRecommendations }
  });
});









