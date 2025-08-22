import Movie from "../models/movie.model.js";
import catchAsync from "./catchAsync.js";
import AppError from "../utils/AppError.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import Category from "../models/category.model.js";
import Rating from "../models/rating.model.js";
import mongoose from "mongoose";

// Cloudinary is configured centrally in utils/cloudinary.js

export const uploadMovie = catchAsync(async (req, res, next) => {
  const { title, description, category, releaseDate } = req.body;

  const categoryDoc = await Category.findOne({ name: category });
  if (!categoryDoc) return next(new AppError("Category not found", 404));

  // Validation
  if (!title || !category) {
    return next(new AppError("Title and category are required!", 400));
  }

  if (!req.file) {
    return next(new AppError("Please upload an image!", 400));
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

// @desc   Get single movie by ID
// @route  GET /api/v1/movies/:id
// @access Public
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

// @desc   Get movie recommendations based on user ratings
// @route  GET /api/v1/movies/recommendations
// @access Private (login required)
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
          averageRating: { $gte: 3.5 } 
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
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          image: 1,
          averageRating: 1,
          releaseDate: 1,
          category: '$categoryInfo.name',
          recommendationScore: '$averageRating'
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
      $unwind: '$categoryInfo'
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
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        image: 1,
        averageRating: 1,
        releaseDate: 1,
        category: '$categoryInfo.name',
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
          category: { $nin: userLikedCategories.map(id => new mongoose.Types.ObjectId(id)) } // Different categories
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
        $unwind: '$categoryInfo'
      },
      {
        $addFields: {
          recommendationScore: '$averageRating'
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
          category: '$categoryInfo.name',
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

  res.status(200).json({
    status: "success",
    results: recommendations.length,
    data: { recommendations }
  });
});

// @desc   Get advanced movie recommendations using collaborative filtering
// @route  GET /api/v1/movies/recommendations/advanced
// @access Private (login required)
export const getAdvancedRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  // Step 1: Find users with similar rating patterns
  const userRatings = await Rating.find({ user: userId });
  
  if (userRatings.length === 0) {
    return res.status(200).json({
      status: "success",
      message: "No ratings found. Please rate some movies first.",
      results: 0,
      data: { recommendations: [] }
    });
  }

  // Step 2: Find similar users based on rating correlation
  const similarUsers = await Rating.aggregate([
    {
      $match: {
        user: { $ne: new mongoose.Types.ObjectId(userId) },
        movie: { $in: userRatings.map(r => r.movie) }
      }
    },
    {
      $group: {
        _id: "$user",
        commonMovies: { $push: "$movie" },
        ratings: { $push: { movie: "$movie", rating: "$rating" } }
      }
    },
    {
      $addFields: {
        similarityScore: {
          $reduce: {
            input: "$commonMovies",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $abs: {
                    $subtract: [
                      { $arrayElemAt: [{ $map: { input: "$ratings", as: "r", in: "$$r.rating" } }, { $indexOfArray: ["$commonMovies", "$$this"] }] },
                      { $arrayElemAt: [{ $map: { input: userRatings.map(r => r.rating), in: "$$this" } }, { $indexOfArray: [userRatings.map(r => r.movie), "$$this"] }] }
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    },
    {
      $sort: { similarityScore: 1 } // Lower score = more similar
    },
    {
      $limit: 5 // Top 5 similar users
    }
  ]);

  if (similarUsers.length === 0) {
    // Fallback to basic recommendations
    return getMovieRecommendations(req, res, next);
  }

  // Step 3: Get movies that similar users rated highly but current user hasn't rated
  const userRatedMovieIds = userRatings.map(r => r.movie.toString());
  const similarUserIds = similarUsers.map(u => u._id);

  const recommendations = await Rating.aggregate([
    {
      $match: {
        user: { $in: similarUserIds },
        rating: { $gte: 4 },
        movie: { $nin: userRatedMovieIds.map(id => new mongoose.Types.ObjectId(id)) }
      }
    },
    {
      $group: {
        _id: "$movie",
        totalRating: { $sum: "$rating" },
        userCount: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movieInfo'
      }
    },
    {
      $unwind: '$movieInfo'
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'movieInfo.category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $addFields: {
        recommendationScore: {
          $add: [
            { $multiply: ['$avgRating', 0.5] },
            { $multiply: ['$userCount', 0.3] },
            { $multiply: ['$movieInfo.averageRating', 0.2] }
          ]
        }
      }
    },
    {
      $project: {
        _id: '$movieInfo._id',
        title: '$movieInfo.title',
        description: '$movieInfo.description',
        image: '$movieInfo.image',
        averageRating: '$movieInfo.averageRating',
        releaseDate: '$movieInfo.releaseDate',
        category: '$categoryInfo.name',
        recommendationScore: { $round: ['$recommendationScore', 2] },
        similarUsersRated: '$userCount'
      }
    },
    {
      $sort: { recommendationScore: -1 }
    },
    {
      $limit: limit
    }
  ]);

  res.status(200).json({
    status: "success",
    results: recommendations.length,
    data: { 
      recommendations,
      similarUsersFound: similarUsers.length,
      method: "collaborative-filtering"
    }
  });
});

// @desc   Get category-based movie recommendations
// @route  GET /api/v1/movies/recommendations/category
// @access Private (login required)
export const getCategoryBasedRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;

  // Step 1: Get user's rating history by category
  const userRatings = await Rating.find({ user: userId }).populate({
    path: 'movie',
    populate: { path: 'category', select: 'name' }
  });

  if (userRatings.length === 0) {
    return res.status(200).json({
      status: "success",
      message: "No ratings found. Please rate some movies first.",
      results: 0,
      data: { recommendations: [] }
    });
  }

  // Step 2: Analyze user's category preferences
  const categoryStats = {};
  userRatings.forEach(rating => {
    const categoryName = rating.movie.category.name;
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = { totalRating: 0, count: 0, avgRating: 0 };
    }
    categoryStats[categoryName].totalRating += rating.rating;
    categoryStats[categoryName].count += 1;
  });

  // Calculate average ratings per category
  Object.keys(categoryStats).forEach(category => {
    categoryStats[category].avgRating = categoryStats[category].totalRating / categoryStats[category].count;
  });

  // Step 3: Find under-explored categories (low count or low rating)
  const underExploredCategories = Object.keys(categoryStats).filter(category => 
    categoryStats[category].count < 3 || categoryStats[category].avgRating < 3
  );

  // Step 4: Get recommendations from under-explored categories
  let recommendations = [];
  
  if (underExploredCategories.length > 0) {
    const categoryIds = await Category.find({ 
      name: { $in: underExploredCategories } 
    }).select('_id');

    recommendations = await Movie.aggregate([
      {
        $match: {
          category: { $in: categoryIds.map(c => c._id) },
          _id: { $nin: userRatings.map(r => r.movie._id) }
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
        $unwind: '$categoryInfo'
      },
      {
        $addFields: {
          recommendationScore: {
            $add: [
              { $multiply: ['$averageRating', 0.7] },
              { $multiply: [{ $size: '$ratings' }, 0.1] },
              { $multiply: [{ $cond: [{ $gte: ['$averageRating', 4] }, 0.2, 0] }, 0.2] }
            ]
          }
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
          category: '$categoryInfo.name',
          recommendationScore: { $round: ['$recommendationScore', 2] },
          reason: 'Under-explored category'
        }
      },
      {
        $sort: { recommendationScore: -1 }
      },
      {
        $limit: Math.ceil(limit / 2)
      }
    ]);
  }

  // Step 5: Fill remaining slots with diverse category recommendations
  const remainingSlots = limit - recommendations.length;
  if (remainingSlots > 0) {
    const allCategories = await Category.find().select('_id name');
    const diverseRecommendations = await Movie.aggregate([
      {
        $match: {
          _id: { $nin: [...userRatings.map(r => r.movie._id), ...recommendations.map(r => r._id)] },
          averageRating: { $gte: 3.5 }
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
        $unwind: '$categoryInfo'
      },
      {
        $addFields: {
          recommendationScore: '$averageRating'
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
          category: '$categoryInfo.name',
          recommendationScore: { $round: ['$recommendationScore', 2] },
          reason: 'Diverse recommendation'
        }
      },
      {
        $sort: { recommendationScore: -1 }
      },
      {
        $limit: remainingSlots
      }
    ]);

    recommendations.push(...diverseRecommendations);
  }

  res.status(200).json({
    status: "success",
    results: recommendations.length,
    data: { 
      recommendations,
      categoryAnalysis: categoryStats,
      underExploredCategories,
      method: "category-based"
    }
  });
});

// @desc   Get comprehensive movie recommendations combining all methods
// @route  GET /api/v1/movies/recommendations/comprehensive
// @access Private (login required)
export const getComprehensiveRecommendations = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 15;

  try {
    // Get recommendations from all three methods
    const [basicRecs, advancedRecs, categoryRecs] = await Promise.all([
      getRecommendationsFromMethod('basic', userId, Math.ceil(limit / 3)),
      getRecommendationsFromMethod('advanced', userId, Math.ceil(limit / 3)),
      getRecommendationsFromMethod('category', userId, Math.ceil(limit / 3))
    ]);

    // Combine and deduplicate recommendations
    const allRecommendations = [...basicRecs, ...advancedRecs, ...categoryRecs];
    const uniqueRecommendations = [];
    const seenIds = new Set();

    allRecommendations.forEach(rec => {
      if (!seenIds.has(rec._id.toString())) {
        seenIds.add(rec._id.toString());
        uniqueRecommendations.push(rec);
      }
    });

    // Sort by recommendation score and limit results
    const finalRecommendations = uniqueRecommendations
      .sort((a, b) => (b.recommendationScore || 0) - (a.recommendationScore || 0))
      .slice(0, limit);

    // Add metadata about each recommendation method
    const methodStats = {
      basic: basicRecs.length,
      advanced: advancedRecs.length,
      category: categoryRecs.length,
      total: finalRecommendations.length
    };

    res.status(200).json({
      status: "success",
      results: finalRecommendations.length,
      data: { 
        recommendations: finalRecommendations,
        methodStats,
        method: "comprehensive-combined"
      }
    });

  } catch (error) {
    // Fallback to basic recommendations if any method fails
    console.error('Comprehensive recommendations error:', error);
    return getMovieRecommendations(req, res, next);
  }
});

// Helper function to get recommendations from specific method
async function getRecommendationsFromMethod(method, userId, limit) {
  try {
    switch (method) {
      case 'basic':
        return await getBasicRecommendations(userId, limit);
      case 'advanced':
        return await getAdvancedRecommendationsHelper(userId, limit);
      case 'category':
        return await getCategoryRecommendationsHelper(userId, limit);
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error getting ${method} recommendations:`, error);
    return [];
  }
}

// Helper function for basic recommendations
async function getBasicRecommendations(userId, limit) {
  const userHighRatings = await Rating.find({
    user: userId,
    rating: { $gte: 4 }
  }).populate('movie', 'category');

  if (userHighRatings.length === 0) {
    return await Movie.aggregate([
      { $match: { averageRating: { $gte: 3.5 } } },
      { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
      { $unwind: '$categoryInfo' },
      { $project: { _id: 1, title: 1, description: 1, image: 1, averageRating: 1, releaseDate: 1, category: '$categoryInfo.name', recommendationScore: '$averageRating' } },
      { $sort: { recommendationScore: -1 } },
      { $limit: limit }
    ]);
  }

  const userLikedCategories = [...new Set(userHighRatings.map(r => r.movie.category._id.toString()))];
  const userRatedMovieIds = userHighRatings.map(r => r.movie._id);

  return await Movie.aggregate([
    { $match: { _id: { $nin: userRatedMovieIds }, category: { $in: userLikedCategories.map(id => new mongoose.Types.ObjectId(id)) } } },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
    { $unwind: '$categoryInfo' },
    { $addFields: { recommendationScore: { $add: [{ $multiply: ['$averageRating', 0.6] }, { $cond: [{ $gte: ['$averageRating', 4] }, 0.3, 0] }, { $cond: [{ $gte: ['$ratings', { $size: '$ratings' }] }, 0.1, 0] }] } } },
    { $project: { _id: 1, title: 1, description: 1, image: 1, averageRating: 1, releaseDate: 1, category: '$categoryInfo.name', recommendationScore: { $round: ['$recommendationScore', 2] } } },
    { $sort: { recommendationScore: -1 } },
    { $limit: limit }
  ]);
}

// Helper function for advanced recommendations
async function getAdvancedRecommendationsHelper(userId, limit) {
  const userRatings = await Rating.find({ user: userId });
  if (userRatings.length === 0) return [];

  // Find similar users based on common movies
  const similarUsers = await Rating.aggregate([
    {
      $match: {
        user: { $ne: new mongoose.Types.ObjectId(userId) },
        movie: { $in: userRatings.map(r => r.movie) }
      }
    },
    {
      $group: {
        _id: "$user",
        commonMovies: { $push: "$movie" },
        ratings: { $push: { movie: "$movie", rating: "$rating" } }
      }
    },
    {
      $addFields: {
        similarityScore: {
          $size: "$commonMovies"
        }
      }
    },
    {
      $sort: { similarityScore: -1 }
    },
    {
      $limit: 5
    }
  ]);

  if (similarUsers.length === 0) return [];

  const userRatedMovieIds = userRatings.map(r => r.movie.toString());
  const similarUserIds = similarUsers.map(u => u._id);

  return await Rating.aggregate([
    {
      $match: {
        user: { $in: similarUserIds },
        rating: { $gte: 4 },
        movie: { $nin: userRatedMovieIds.map(id => new mongoose.Types.ObjectId(id)) }
      }
    },
    {
      $group: {
        _id: "$movie",
        totalRating: { $sum: "$rating" },
        userCount: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    },
    {
      $lookup: {
        from: 'movies',
        localField: '_id',
        foreignField: '_id',
        as: 'movieInfo'
      }
    },
    {
      $unwind: '$movieInfo'
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'movieInfo.category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    {
      $unwind: '$categoryInfo'
    },
    {
      $addFields: {
        recommendationScore: {
          $add: [
            { $multiply: ['$avgRating', 0.5] },
            { $multiply: ['$userCount', 0.3] },
            { $multiply: ['$movieInfo.averageRating', 0.2] }
          ]
        }
      }
    },
    {
      $project: {
        _id: '$movieInfo._id',
        title: '$movieInfo.title',
        description: '$movieInfo.description',
        image: '$movieInfo.image',
        averageRating: '$movieInfo.averageRating',
        releaseDate: '$movieInfo.releaseDate',
        category: '$categoryInfo.name',
        recommendationScore: { $round: ['$recommendationScore', 2] },
        similarUsersRated: '$userCount'
      }
    },
    {
      $sort: { recommendationScore: -1 }
    },
    {
      $limit: limit
    }
  ]);
}

// Helper function for category recommendations
async function getCategoryRecommendationsHelper(userId, limit) {
  const userRatings = await Rating.find({ user: userId }).populate({ path: 'movie', populate: { path: 'category', select: 'name' } });
  if (userRatings.length === 0) return [];

  const categoryStats = {};
  userRatings.forEach(rating => {
    const categoryName = rating.movie.category.name;
    if (!categoryStats[categoryName]) {
      categoryStats[categoryName] = { totalRating: 0, count: 0, avgRating: 0 };
    }
    categoryStats[categoryName].totalRating += rating.rating;
    categoryStats[categoryName].count += 1;
  });

  Object.keys(categoryStats).forEach(category => {
    categoryStats[category].avgRating = categoryStats[category].totalRating / categoryStats[category].count;
  });

  const underExploredCategories = Object.keys(categoryStats).filter(category => 
    categoryStats[category].count < 3 || categoryStats[category].avgRating < 3
  );

  if (underExploredCategories.length === 0) return [];

  const categoryIds = await Category.find({ name: { $in: underExploredCategories } }).select('_id');

  return await Movie.aggregate([
    { $match: { category: { $in: categoryIds.map(c => c._id) }, _id: { $nin: userRatings.map(r => r.movie._id) } } },
    { $lookup: { from: 'categories', localField: 'category', foreignField: '_id', as: 'categoryInfo' } },
    { $unwind: '$categoryInfo' },
    { $addFields: { recommendationScore: { $add: [{ $multiply: ['$averageRating', 0.7] }, { $multiply: [{ $size: '$ratings' }, 0.1] }, { $multiply: [{ $cond: [{ $gte: ['$averageRating', 4] }, 0.2, 0] }, 0.2] }] } } },
    { $project: { _id: 1, title: 1, description: 1, image: 1, averageRating: 1, releaseDate: 1, category: '$categoryInfo.name', recommendationScore: { $round: ['$recommendationScore', 2] }, reason: 'Under-explored category' } },
    { $sort: { recommendationScore: -1 } },
    { $limit: limit }
  ]);
}


