import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
// import hpp from "hpp";
// import { FilterXSS } from "xss";
// import sanitize from "mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./controllers/globalErrorHandler.js";
import connectDB from "./connection/connectDB.js";
// import { generalLimiter, loginLimiter } from "./middleware/rateLimiter.js";

// Routers
import userRouter from "./routes/user.routes.js";
import movieRouter from "./routes/movie.routes.js";
// import authRouter from "./routes/auth.routes.js";
// import categoryRouter from "./routes/category.routes.js";
// import movieRouter from "./routes/movie.routes.js";
// import ratingRouter from "./routes/rating.routes.js";

// ✅ Catch uncaught exceptions (synchronous errors)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

dotenv.config(); // Load config.env

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

// Sanitize data (NoSQL injection & XSS)
// app.use((req, res, next) => {
//   ["body", "query", "params"].forEach((key) => {
//     if (req[key]) {
//       Object.keys(req[key]).forEach((prop) => {
//         req[key][prop] = sanitize(req[key][prop]);
//       });
//     }
//   });
//   next();
// });

// const xssFilter = new FilterXSS({
//   whiteList: {},
//   stripIgnoreTag: true,
//   stripIgnoreTagBody: ["script"],
// });
// app.use((req, res, next) => {
//   if (req.body) {
//     Object.keys(req.body).forEach((key) => {
//       if (typeof req.body[key] === "string") {
//         req.body[key] = xssFilter.process(req.body[key]);
//       }
//     });
//   }
//   next();
// });

// Rate limiters
//app.use(generalLimiter);
// app.use("/api/v1/auth/login", loginLimiter);

// Prevent HTTP param pollution
// app.use(
//   hpp({
//     whitelist: ["sort", "rating"],
//   })
// );

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(`${__dirname}/public`));

// Dev logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ✅ Connect DB
await connectDB();

console.log("Cloudinary Config:");
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API Key   :", process.env.CLOUDINARY_API_KEY);
// Do not log API secret for security


// Custom middleware
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/movies" , movieRouter)
// app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/categories", categoryRouter);
// app.use("/api/v1/movies", movieRouter);
// app.use("/api/v1/ratings", ratingRouter);

// Handle undefined routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handler
app.use(globalErrorHandler);

// ✅ Start server
const port = process.env.PORT || 7000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// ✅ Handle unhandled promise rejections (async DB errors etc.)
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
