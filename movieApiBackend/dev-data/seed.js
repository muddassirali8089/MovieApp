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
await connectDB();

// Movies JSON with more comprehensive data
const moviesData = [
  {
    category: "Action",
    movies: [
      {
        title: "Mad Max: Fury Road",
        description: "Post-apocalyptic action ride through the wasteland with intense car chases and stunning visuals.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000001/madmax.jpg",
        releaseDate: "2015-05-15",
      },
      {
        title: "John Wick",
        description: "A retired hitman seeks vengeance after the death of his dog, leading to an epic action thriller.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000002/johnwick.jpg",
        releaseDate: "2014-10-24",
      },
      {
        title: "Gladiator",
        description: "A Roman general fights for honor and revenge in the brutal world of gladiatorial combat.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000003/gladiator.jpg",
        releaseDate: "2000-05-05",
      },
      {
        title: "Mission: Impossible - Fallout",
        description: "Ethan Hunt faces his most dangerous mission yet in this high-stakes action thriller.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000004/missionimpossible.jpg",
        releaseDate: "2018-07-27",
      },
      {
        title: "The Dark Knight",
        description: "Batman faces his greatest challenge in the form of the chaotic Joker.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000005/darkknight.jpg",
        releaseDate: "2008-07-18",
      },
    ],
  },
  {
    category: "Horror",
    movies: [
      {
        title: "The Conjuring",
        description: "Paranormal investigators fight evil spirits in this chilling supernatural horror film.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000011/conjuring.jpg",
        releaseDate: "2013-07-19",
      },
      {
        title: "Get Out",
        description: "A chilling psychological thriller that explores racism through the lens of horror.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000012/getout.jpg",
        releaseDate: "2017-02-24",
      },
      {
        title: "A Quiet Place",
        description: "A family must live in silence to avoid mysterious creatures that hunt by sound.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000013/quietplace.jpg",
        releaseDate: "2018-04-06",
      },
      {
        title: "Hereditary",
        description: "A family tragedy leads to terrifying supernatural occurrences in this psychological horror.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000014/hereditary.jpg",
        releaseDate: "2018-06-08",
      },
    ],
  },
  {
    category: "Comedy",
    movies: [
      {
        title: "The Hangover",
        description: "A wild bachelor party goes wrong, leading to hilarious misadventures in Las Vegas.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000021/hangover.jpg",
        releaseDate: "2009-06-05",
      },
      {
        title: "Superbad",
        description: "Two teens navigate high school chaos in this coming-of-age comedy classic.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000022/superbad.jpg",
        releaseDate: "2007-08-17",
      },
      {
        title: "Bridesmaids",
        description: "A maid of honor's life unravels as she tries to plan her best friend's wedding.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000023/bridesmaids.jpg",
        releaseDate: "2011-05-13",
      },
      {
        title: "Deadpool",
        description: "A wisecracking mercenary with accelerated healing powers seeks revenge.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000024/deadpool.jpg",
        releaseDate: "2016-02-12",
      },
    ],
  },
  {
    category: "Animated",
    movies: [
      {
        title: "Toy Story",
        description: "Toys come to life when humans leave in this groundbreaking animated adventure.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000031/toystory.jpg",
        releaseDate: "1995-11-22",
      },
      {
        title: "Finding Nemo",
        description: "A clownfish searches for his son across the vast ocean in this heartwarming tale.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000032/nemo.jpg",
        releaseDate: "2003-05-30",
      },
      {
        title: "Spider-Man: Into the Spider-Verse",
        description: "A young Spider-Man discovers the multiverse in this visually stunning animated film.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000033/spiderverse.jpg",
        releaseDate: "2018-12-14",
      },
      {
        title: "Coco",
        description: "A young musician embarks on a journey to the Land of the Dead to uncover family secrets.",
        image: "https://res.cloudinary.com/demo/image/upload/v1700000034/coco.jpg",
        releaseDate: "2017-11-22",
      },
    ],
  },
];

// Seed function
const seedMovies = async () => {
  try {
    console.log("🌱 Starting database seeding...");
    
    // 1️⃣ Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Category.deleteMany();
    await Movie.deleteMany();
    console.log("✅ Existing data cleared");

    // 2️⃣ Create categories first
    console.log("📂 Creating categories...");
    const categoryDocs = {};
    for (const cat of ["Action", "Horror", "Comedy", "Animated"]) {
      const createdCat = await Category.create({ name: cat });
      categoryDocs[cat] = createdCat._id;
      console.log(`✅ Created category: ${cat}`);
    }

    // 3️⃣ Insert movies
    console.log("🎬 Creating movies...");
    let totalMovies = 0;
    for (const catObj of moviesData) {
      const catId = categoryDocs[catObj.category];
      const moviesToInsert = catObj.movies.map((m) => ({
        ...m,
        category: catId,
      }));
      await Movie.insertMany(moviesToInsert);
      totalMovies += moviesToInsert.length;
      console.log(`✅ Created ${moviesToInsert.length} movies for ${catObj.category}`);
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Total categories: 4`);
    console.log(`📊 Total movies: ${totalMovies}`);
    console.log(`\n🚀 Your movie API is ready to use!`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
  }
};

// Run seed
seedMovies();
