import User from "../models/user.model.js";
import catchAsync from "../controllers/catchAsync.js";
import AppError from "../utils/AppError.js";

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
export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, address, image } = req.body;

  // Only allow these fields
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name, address, image },
    {
      new: true, // return updated doc
      runValidators: true,
    }
  ).select("-password");

  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
