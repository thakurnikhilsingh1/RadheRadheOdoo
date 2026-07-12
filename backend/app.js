const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import error handler
const errorHandler = require("./middleware/errorHandler");
const ApiError = require("./utils/ApiError");

// Create Express app
const app = express();

// Behind Replit's proxy; needed for rate-limiting and req.ip to work correctly.
app.set("trust proxy", 1);

// Security headers
app.use(helmet());

// CORS
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(
  cors({
    origin: corsOrigin === "*" ? true : corsOrigin.split(",").map((o) => o.trim()),
  })
);

// Logging
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic rate limiting — tighter on auth to slow down credential stuffing.
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
app.use("/api/", generalLimiter);
app.use("/api/auth", authLimiter);

// Routes

const authRoutes = require("./routes/auth.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const driverRoutes = require("./routes/driver.routes");
const tripRoutes = require("./routes/trip.routes");
const maintenanceRoutes = require("./routes/maintenance.routes");
const fuelRoutes = require("./routes/fuel.routes");
const expenseRoutes = require("./routes/expense.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

// API endpoints

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "TransitOps Backend Running 🚚" });
});

app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    status: "ok",
    dbConnected: mongoose.connection.readyState === 1,
  });
});

// Unknown route -> 404
app.use((req, res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
});

// Error handler
// Always keep this at the end
app.use(errorHandler);

module.exports = app;
