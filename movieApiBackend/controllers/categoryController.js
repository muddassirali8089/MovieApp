import Category from "../models/category.model.js";
import catchAsync from "./catchAsync.js";

export const getCategories = catchAsync(async (req, res, next) => {
  // Fetch all categories
  const categories = await Category.find().select("name"); // only return name

  res.status(200).json({
    status: "success",
    results: categories.length,
    data: { categories },
  });
});
