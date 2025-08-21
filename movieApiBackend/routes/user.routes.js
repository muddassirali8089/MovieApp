import express from "express";
import { login, protect, signup } from "../controllers/authController.js";
import {loginLimiter} from "../utils/rateLimiters.js"
import { getProfile, updateProfile } from "../controllers/profileController.js";

const router = express.Router();

// Only signup route
router.post("/signup", signup);
router.post("/login",login)

router.get("/me", protect, getProfile);
router.patch("/updateMe", protect, updateProfile);


export default router;
