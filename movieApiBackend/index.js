import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import cors from "cors";
import hpp from "hpp";
import { FilterXSS } from 'xss';
import sanitize from 'mongo-sanitize';
import { fileURLToPath } from "url";
import AppError from "./utils/AppError.js";
// Import your NEW routers
import userRouter from "./routes/user.routes.js";
import authRouter from "./routes/auth.routes.js"; // NEW: For login/signup
import categoryRouter from "./routes/category.routes.js"; // NEW
import movieRouter from "./routes/movie.routes.js"; // NEW
import ratingRouter from "./routes/rating.routes.js"; // NEW
import connectDB from "./config/connectDB.js"; // Assuming path is ./config/
import globalErrorHandler from "./controllers/errorController.js"; // Assuming path
import { generalLimiter, loginLimiter } from "./middleware/rateLimiter.js"; // Assuming path

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Catch uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

dotenv.config();
const app = express();
app.use(helmet());

// ✅ CORS - Allow your Next.js frontend (port 3000) to talk to the backend (port 8000)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000', 
  credentials: true // If you use cookies later
}))

app.use(express.json({ limit: "10kb" }));

// ✅ Security Middleware (Keep your excellent setup)
app.use((req, res, next) => {
  ['body', 'query', 'params'].forEach(key => {
    if (req[key]) {
      Object.keys(req[key]).forEach(prop => {
        req[key][prop] = sanitize(req[key][prop]);
      });
    }
  });
  next();
});

const xssFilter = new FilterXSS({
  whiteList: {},
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script']
});
app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') { // Check if it's a string to avoid errors on numbers/arrays
        req.body[key] = xssFilter.process(req.body[key]);
      }
    });
  }
  next();
});

app.use(generalLimiter);
// Apply login limiter specifically to the login route
app.use('/api/v1/auth/login', loginLimiter);

app.use(hpp({
  whitelist: ['sort'] // You might add more for movies later, like 'rating'
}));

app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ✅ Connect to DB
await connectDB();

// ✅ Custom middleware to add request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers); // Optional for debugging auth
  next();
});

// ✅ API Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter); // NEW: Login & Signup
app.use("/api/v1/categories", categoryRouter); // NEW
app.use("/api/v1/movies", movieRouter); // NEW
app.use("/api/v1/ratings", ratingRouter); // NEW

// ✅ 404 for undefined routes
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// ✅ Global error handler
app.use(globalErrorHandler);

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

// ✅ Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

export default app;