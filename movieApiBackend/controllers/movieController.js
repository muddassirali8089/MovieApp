import Movie from "../models/movie.model.js";
import catchAsync from "./catchAsync.js";
import AppError from "../utils/AppError.js";
import cloudinary from "../utils/cloudinary.js";
import streamifier from "streamifier";
import Category from "../models/category.model.js";

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


