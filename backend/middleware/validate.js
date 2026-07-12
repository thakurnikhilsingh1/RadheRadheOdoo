const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

// Runs after an array of express-validator checks; turns failures into a
// single 400 ApiError instead of letting each route handle it manually.
function validate(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      ApiError.badRequest(
        "Validation failed",
        errors.array().map((e) => ({ field: e.path, message: e.msg }))
      )
    );
  }
  next();
}

module.exports = validate;
