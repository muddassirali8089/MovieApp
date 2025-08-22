import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import sanitize from "mongo-sanitize";
import { FilterXSS } from "xss";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./controllers/globalErrorHandler.js";
import connectDB from "./connection/connectDB.js";
import { generalLimiter, loginLimiter } from "./utils/rateLimiters.js";

// Routers
import userRouter from "./routes/user.routes.js";
import movieRouter from "./routes/movie.routes.js";

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
app.use((req, res, next) => {
  ["body", "query", "params"].forEach((key) => {
    if (req[key]) {
      Object.keys(req[key]).forEach((prop) => {
        if (typeof req[key][prop] === "string") {
          req[key][prop] = sanitize(req[key][prop]);
        }
      });
    }
  });
  next();
});

// XSS Protection
const xssFilter = new FilterXSS({
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script"],
});
app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = xssFilter.process(req.body[key]);
      }
    });
  }
  next();
});

// Rate limiters
app.use(generalLimiter);
app.use("/api/v1/users/login", loginLimiter);
app.use("/api/v1/users/signup", loginLimiter);

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

// ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/movies" , movieRouter)

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
  console.log(`Security features: Helmet, CORS, Rate Limiting, XSS Protection, NoSQL Injection Protection`);
});

// ✅ Handle unhandled promise rejections (async DB errors etc.)
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});
