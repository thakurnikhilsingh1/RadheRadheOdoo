const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

/** Verifies the JWT and attaches { userId, roleName } to req.user */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Missing or malformed Authorization header"));
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, roleName }
    next();
  } catch (err) {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }
}

/** Usage: requireRole('Fleet Manager', 'Admin') */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Not authenticated"));
    }
    if (!allowedRoles.includes(req.user.roleName)) {
      return next(
        ApiError.forbidden(`Role '${req.user.roleName}' is not permitted to perform this action`)
      );
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
