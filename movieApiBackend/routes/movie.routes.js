import express from "express";
import { getMovies,  uploadMovie } from "../controllers/movieController.js";
import { protect } from "../controllers/authController.js";


import {upload} from "../controllers/upload.js";
import { getCategories } from "../controllers/categoryController.js";
const router = express.Router();

// 1️⃣ Public: get all movies (optional search & category filter)
router.post("/", protect, upload.single("image"), uploadMovie);

router.get("/", getMovies); 
router.get("/categories", getCategories);
 


// 2️⃣ Protected: rate a movie (login required)
// router.post("/:id/rate", protect, rateMovie);

export default router;
