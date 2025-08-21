import express from "express";
import { login, protect, signup } from "../controllers/authController.js";
import {loginLimiter} from "../utils/rateLimiters.js"
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { getMyRatings } from "../controllers/ratingController.js";
import {upload} from "../controllers/upload.js";
const router = express.Router();

// Only signup route
router.post("/signup", upload.single("profileImage"), signup);
router.post("/login",login)

router.get("/me", protect, getProfile);
router.patch("/updateProfile", protect, upload.single("profileImage"), updateProfile);
router.get("/my-ratings", protect, getMyRatings);

export default router;
