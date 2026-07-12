const Driver = require("../models/Driver");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getDrivers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const drivers = await Driver.find(filter).sort({ created_at: -1 });
  res.json(drivers);
});

exports.getDriverById = asyncHandler(async (req, res) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) throw ApiError.notFound("Driver not found");
  res.json(driver);
});

exports.createDriver = asyncHandler(async (req, res) => {
  const { name, license_number, license_category, license_expiry_date, contact_number, safety_score } = req.body;

  const driver = await Driver.create({
    name,
    license_number,
    license_category,
    license_expiry_date,
    contact_number,
    safety_score,
  });

  res.status(201).json(driver);
});

exports.updateDriver = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "license_category", "contact_number", "status", "safety_score"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const driver = await Driver.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!driver) throw ApiError.notFound("Driver not found");

  res.json(driver);
});

// Soft delete: drivers are suspended, never hard-deleted, so trip history
// keeps referencing a valid driver document.
exports.deleteDriver = asyncHandler(async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { status: "Suspended" },
    { new: true, runValidators: true }
  );
  if (!driver) throw ApiError.notFound("Driver not found");

  res.json({ message: "Driver suspended", driver });
});
