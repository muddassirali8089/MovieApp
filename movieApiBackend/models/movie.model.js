import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Movie must have a title"],
      unique: true,
      trim: true,
      minlength: [2, "Movie title must be at least 2 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Movie must belong to a category"],
    },
    image: {
      type: String, // Cloudinary URL
      default: "https://res.cloudinary.com/dujmvhjyt/image/upload/v1755821112/movies/ckeretpb1cievueuxvci.jpg",
      required: [true, "Movie must have an image"],
    },
    releaseDate: {
      type: Date,
    },

    // ⭐ New fields for ratings
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          min: [1, "Rating must be at least 1"],
          max: [5, "Rating cannot exceed 5"],
          required: true,
        },
      },
    ],
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

// Middleware to auto-update averageRating whenever ratings change
movieSchema.pre("save", function (next) {
  if (this.ratings.length > 0) {
    const avg =
      this.ratings.reduce((sum, r) => sum + r.rating, 0) /
      this.ratings.length;
    this.averageRating = Math.round(avg * 10) / 10; // round to 1 decimal
  } else {
    this.averageRating = 0;
  }
  next();
});

const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
