import User from "../models/user.model.js";
import catchAsync from "../controllers/catchAsync.js";
import AppError from "../utils/AppError.js";
import validator from "validator";

import jwt from "jsonwebtoken";
import { promisify } from "util"; // 👈 import this at the top

import { signToken } from "../utils/jwt.js";
export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // Cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    httpOnly: true, // cookie can't be accessed via JS (XSS protection)
    secure: process.env.NODE_ENV === "production", // send over HTTPS in production
    sameSite: "strict", // CSRF protection
  };

  // Set cookie
  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  // Send response
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, address, profileImage } = req.body;

  // 🔹 Validations
  if (!name || !email || !password || !confirmPassword) {
    return next(new AppError("Name, email, password, and confirmPassword are required", 400));
  }
  if (!validator.isEmail(email)) {
    return next(new AppError("Invalid email format", 400));
  }
  if (password.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }
  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  // 🔹 Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email is already register.", 400));
  }

  // 🔹 Create user
  const newUser = await User.create({
    name,
    email,
    password,
    confirmPassword,   // ✅ important
    address,
    profileImage: profileImage || undefined,
  });

  // 🔹 Send JWT + user data
  createSendToken(newUser, 201, res);
});



export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2. Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3. If everything ok, send token to client
  createSendToken(user, 200, res);
});


export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401)
    );
  }

  // 4) (Optional) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    );
  }

  // 5) Grant access to protected route
  req.user = currentUser;
  next();
});

