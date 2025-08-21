import express from "express";
import { getMovies, getMovie, uploadMovie } from "../controllers/movieController.js";
import { protect } from "../controllers/authController.js";
import { rateMovie, getMyRating, getMovieRatings } from "../controllers/ratingController.js";
import { upload } from "../controllers/upload.js";
import { getCategories } from "../controllers/categoryController.js";

const router = express.Router();

// Public routes
router.get("/", getMovies); // Get all movies with search, category filter, and sorting
router.get("/categories", getCategories); // Get all categories
router.get("/:id", getMovie); // Get single movie by ID
router.get("/:id/ratings", getMovieRatings); // Get all ratings for a movie

// Protected routes (login required)
router.post("/", protect, upload.single("image"), uploadMovie); // Upload new movie
router.post("/:id/rate", protect, rateMovie); // Rate a movie
router.get("/:id/my-rating", protect, getMyRating); // Get user's rating for a movie

export default router;
