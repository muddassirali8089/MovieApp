import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Movie from "../models/movie.model.js";
import Category from "../models/category.model.js";
import connectDB from "../connection/connectDB.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB()

// Movies JSON
const moviesData = [
  {
    category: "Action",
    movies: [
      {
        title: "Mad Max: Fury Road",
        description: "Post-apocalyptic action ride.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000001/madmax.jpg",
        releaseDate: "2015-05-15",
      },
      {
        title: "John Wick",
        description: "A retired hitman seeks vengeance.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000002/johnwick.jpg",
        releaseDate: "2014-10-24",
      },
      {
        title: "Gladiator",
        description: "A Roman general fights for honor.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000003/gladiator.jpg",
        releaseDate: "2000-05-05",
      },
    ],
  },
  {
    category: "Horror",
    movies: [
      {
        title: "The Conjuring",
        description: "Paranormal investigators fight evil.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000011/conjuring.jpg",
        releaseDate: "2013-07-19",
      },
      {
        title: "Get Out",
        description: "A chilling psychological thriller.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000012/getout.jpg",
        releaseDate: "2017-02-24",
      },
    ],
  },
  {
    category: "Comedy",
    movies: [
      {
        title: "The Hangover",
        description: "A wild bachelor party goes wrong.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000021/hangover.jpg",
        releaseDate: "2009-06-05",
      },
      {
        title: "Superbad",
        description: "Two teens navigate high school chaos.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000022/superbad.jpg",
        releaseDate: "2007-08-17",
      },
    ],
  },
  {
    category: "Animated",
    movies: [
      {
        title: "Toy Story",
        description: "Toys come to life when humans leave.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000031/toystory.jpg",
        releaseDate: "1995-11-22",
      },
      {
        title: "Finding Nemo",
        description: "A clownfish searches for his son.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000032/nemo.jpg",
        releaseDate: "2003-05-30",
      },
    ],
  },
];

// Seed function
const seedMovies = async () => {
  try {
    // 1️⃣ Clear existing data
    await Category.deleteMany();
    await Movie.deleteMany();

    // 2️⃣ Create categories first
    const categoryDocs = {};
    for (const cat of ["Action", "Horror", "Comedy", "Animated"]) {
      const createdCat = await Category.create({ name: cat });
      categoryDocs[cat] = createdCat._id;
    }

    // 3️⃣ Insert movies
    for (const catObj of moviesData) {
      const catId = categoryDocs[catObj.category];
      const moviesToInsert = catObj.movies.map((m) => ({
        ...m,
        category: catId,
      }));
      await Movie.insertMany(moviesToInsert);
    }

    console.log("✅ Movies and categories imported successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error importing movies:", err);
    process.exit(1);
  }
};

// Run seed
seedMovies();
