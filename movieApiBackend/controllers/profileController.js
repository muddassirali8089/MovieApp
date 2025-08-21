import User from "../models/user.model.js";
import catchAsync from "../controllers/catchAsync.js";
import AppError from "../utils/AppError.js";

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
// @desc   Get user profile
// @route  GET /api/v1/users/me
// @access Private
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password"); // don’t send password
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// @desc   Update user profile
// @route  PATCH /api/v1/users/updateMe
// @access Private


// Make sure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const updateProfile = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Assume protect middleware sets req.user
  const { name } = req.body;

  if (!name && !req.file) {
    return next(new AppError("Provide a name or image to update!", 400));
  }

  const updateData = {};

  if (name) updateData.name = name;

  if (req.file) {
    // Upload new image to Cloudinary
    const uploadedImage = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "users", // store profile images under users folder
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
    });

    updateData.profileImage = uploadedImage.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: { user: updatedUser },
  });
});

