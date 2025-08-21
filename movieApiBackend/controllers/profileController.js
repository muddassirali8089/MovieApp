import User from "../models/user.model.js";
import catchAsync from "../controllers/catchAsync.js";
import AppError from "../utils/AppError.js";

import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// @desc   Get user profile
// @route  GET /api/v1/users/me
// @access Private
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password"); // Use req.user.id instead of req.user._id
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
// @route  PATCH /api/v1/users/updateProfile
// @access Private

// Make sure Cloudinary is configured
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Cloudinary configuration missing:', {
    cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !!process.env.CLOUDINARY_API_KEY,
    api_secret: !!process.env.CLOUDINARY_API_SECRET
  });
}

export const updateProfile = catchAsync(async (req, res, next) => {
  try {
    const userId = req.user.id; // Use req.user.id instead of req.user._id
    const { name, address, dateOfBirth } = req.body;

    console.log('Update Profile Request:', {
      userId,
      body: req.body,
      hasFile: !!req.file,
      fileType: req.file?.mimetype
    });

    if (!name && !address && !dateOfBirth && !req.file) {
      return next(new AppError("Provide at least one field to update!", 400));
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (address) updateData.address = address;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;

    if (req.file) {
      console.log('Processing image upload...');
      // Upload new image to Cloudinary
      const uploadedImage = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "users", // store profile images under users folder
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('Image uploaded successfully:', result.secure_url);
              resolve(result);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      updateData.profileImage = uploadedImage.secure_url;
    }

    console.log('Updating user with data:', updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    console.log('User updated successfully:', updatedUser._id);

    res.status(200).json({
      status: "success",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return next(error);
  }
});

