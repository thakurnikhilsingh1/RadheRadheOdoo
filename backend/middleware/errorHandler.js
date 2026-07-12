const ApiError = require("../utils/ApiError");

/**
 * Central error handler. Must be registered last, after all routes.
 * Normalizes Mongoose + custom ApiError + unexpected errors into a
 * consistent { error, details? } JSON shape.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    console.error(err);
  } else if (!(err instanceof ApiError)) {
    // Still log unexpected errors in production, just not full stack to the client.
    console.error(err);
  }

  // Our own thrown errors already know their status code.
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Mongoose validation error (schema constraints).
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: "Validation failed", details });
  }

  // Malformed ObjectId in a route param / body reference.
  if (err.name === "CastError") {
    return res.status(400).json({
      error: `Invalid value for '${err.path}'`,
    });
  }

  // Duplicate key (unique index violation), e.g. registration_number, email.
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      error: `A record with that ${field} already exists`,
      details: err.keyValue,
    });
  }

  return res.status(500).json({
    error: isProd ? "Internal server error" : err.message,
  });
}

module.exports = errorHandler;
