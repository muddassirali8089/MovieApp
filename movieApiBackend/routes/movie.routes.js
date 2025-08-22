import express from "express";
import { getMovies, getMovie, uploadMovie, getMovieRecommendations } from "../controllers/movieController.js";
import { protect } from "../controllers/authController.js";
import { rateMovie, getMyRating, getMovieRatings, getMyRatings } from "../controllers/ratingController.js";
import { upload } from "../controllers/upload.js";
import { getCategories } from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/", getMovies); // Get all movies with search, category filter, and sorting
router.get("/categories", getCategories); // Get all categories

// Protected routes (login required) - MUST come BEFORE :id routes
router.get("/recommendations", protect, getMovieRecommendations); // Get personalized movie recommendations
router.get("/my-ratings", protect, getMyRatings); // Get user's rated movies

// Dynamic routes (must come after specific routes)
router.get("/:id", getMovie); // Get single movie by ID
router.get("/:id/ratings", getMovieRatings); // Get all ratings for a movie
router.post("/:id/rate", protect, rateMovie); // Rate a movie
router.get("/:id/my-rating", protect, getMyRating); // Get user's rating for a movie

// Admin routes
router.post("/", protect, upload.single("image"), uploadMovie); // Upload new movie

export default router;
