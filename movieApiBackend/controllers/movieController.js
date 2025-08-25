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

  try {
    // Step 1: Get user's ratings
    const userRatings = await Rating.find({ user: userId }).populate('movie', 'category');
    
    // Step 2: Get all movies and categories for the microservice
    const movies = await Movie.find().populate('category', 'name');
    const categories = await Category.find();

    // Step 3: Prepare data for microservice
    const ratingsForMicroservice = userRatings.map(rating => ({
      movieId: rating.movie._id.toString(),
      rating: rating.rating
    }));

    const moviesForMicroservice = movies.map(movie => ({
      _id: movie._id.toString(),
      title: movie.title,
      description: movie.description,
      image: movie.image,
      averageRating: movie.averageRating || 0,
      releaseDate: movie.releaseDate,
      category: movie.category._id.toString(),
      categoryName: movie.category.name,
      ratings: movie.ratings || []
    }));

    const categoriesForMicroservice = categories.map(cat => ({
      _id: cat._id.toString(),
      name: cat.name
    }));

    // Step 4: Call the recommendation microservice
    const recommendationServiceUrl = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:5000';
    
    console.log(`🔗 Calling recommendation microservice for user ${userId}`);
    
    const response = await fetch(`${recommendationServiceUrl}/get-recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        userRatings: ratingsForMicroservice,
        movies: moviesForMicroservice,
        categories: categoriesForMicroservice,
        limit
      })
    });

    if (!response.ok) {
      throw new Error(`Microservice responded with status: ${response.status}`);
    }

    const microserviceResponse = await response.json();
    
    console.log(`✅ Received recommendations from microservice for user ${userId}`);

    // Step 5: Return the recommendations from microservice
    res.status(200).json(microserviceResponse);

  } catch (error) {
    console.error('❌ Error calling recommendation microservice:', error);
    
    // Return error - let the microservice handle everything
    res.status(500).json({
      status: "error",
      message: "Failed to get recommendations from microservice",
      error: error.message
    });
  }
});









