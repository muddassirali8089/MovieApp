import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      required: [true, "Rating is required"],
    },
  },
  { timestamps: true }
);

ratingSchema.index({ user: 1, movie: 1 }, { unique: true }); // Prevent duplicate ratings

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
