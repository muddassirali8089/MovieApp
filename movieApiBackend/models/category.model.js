import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category must have a name"],
      unique: true,
      enum: {
        values: ["Action", "Horror", "Comedy", "Animated"],
        message: "Category must be Action, Horror, Comedy, or Animated",
      },
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
