const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const SALT_ROUNDS = 10;

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role_name } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("A user with that email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role_name: role_name || undefined,
  });

  res.status(201).json(user.toJSON());
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      roleName: user.role_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email, role_name: user.role_name },
  });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user) {
    throw ApiError.notFound("User not found");
  }
  res.json(user.toJSON());
});
