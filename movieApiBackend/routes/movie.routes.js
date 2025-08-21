import express from "express";
import { getMovies } from "../controllers/movieController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

// 1️⃣ Public: get all movies (optional search & category filter)
router.get("/", getMovies);  // ✅ no protect, public access

// 2️⃣ Protected: rate a movie (login required)
// router.post("/:id/rate", protect, rateMovie);

export default router;
