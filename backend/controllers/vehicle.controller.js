const Vehicle = require("../models/Vehicle");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getVehicles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const vehicles = await Vehicle.find(filter).sort({ created_at: -1 });
  res.json(vehicles);
});

exports.getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) throw ApiError.notFound("Vehicle not found");
  res.json(vehicle);
});

exports.createVehicle = asyncHandler(async (req, res) => {
  const { registration_number, vehicle_name, vehicle_type, max_load_capacity, odometer, acquisition_cost } =
    req.body;

  const vehicle = await Vehicle.create({
    registration_number,
    vehicle_name,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
  });

  res.status(201).json(vehicle);
});

exports.updateVehicle = asyncHandler(async (req, res) => {
  const allowedFields = ["vehicle_name", "vehicle_type", "odometer", "acquisition_cost", "status"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!vehicle) throw ApiError.notFound("Vehicle not found");

  res.json(vehicle);
});

// Soft delete: vehicles are retired, never hard-deleted, so trip/maintenance
// history keeps referencing a valid vehicle document.
exports.deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    { status: "Retired" },
    { new: true, runValidators: true }
  );
  if (!vehicle) throw ApiError.notFound("Vehicle not found");

  res.json({ message: "Vehicle retired", vehicle });
});
