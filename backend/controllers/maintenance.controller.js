const mongoose = require("mongoose");
const MaintenanceLog = require("../models/MaintenanceLog");
const Vehicle = require("../models/Vehicle");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getMaintenance = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.vehicle_id) filter.vehicle_id = req.query.vehicle_id;
  if (req.query.status) filter.status = req.query.status;

  const logs = await MaintenanceLog.find(filter).sort({ created_at: -1 });
  res.json(logs);
});

exports.createMaintenance = asyncHandler(async (req, res) => {
  const { vehicle_id, maintenance_type, description, cost, start_date } = req.body;

  const vehicle = await Vehicle.findById(vehicle_id);
  if (!vehicle) throw ApiError.notFound("Vehicle not found");
  if (vehicle.status === "Retired") {
    throw ApiError.badRequest("Retired vehicles cannot be sent for maintenance");
  }

  const session = await mongoose.startSession();
  try {
    let log;
    await session.withTransaction(async () => {
      const created = await MaintenanceLog.create(
        [{ vehicle_id, maintenance_type, description, cost, start_date, status: "Active" }],
        { session }
      );
      log = created[0];

      await Vehicle.findByIdAndUpdate(vehicle_id, { status: "In Shop" }, { session });
    });
    res.status(201).json(log);
  } finally {
    session.endSession();
  }
});

exports.closeMaintenance = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let log;
    await session.withTransaction(async () => {
      const found = await MaintenanceLog.findById(req.params.id).session(session);
      if (!found) throw ApiError.notFound("Maintenance log not found");
      if (found.status === "Completed") {
        throw ApiError.badRequest("Maintenance log is already completed");
      }

      found.status = "Completed";
      found.end_date = new Date();
      await found.save({ session });
      log = found;

      const vehicle = await Vehicle.findById(found.vehicle_id).session(session);
      if (vehicle && vehicle.status !== "Retired") {
        vehicle.status = "Available";
        await vehicle.save({ session });
      }
    });
    res.json({ message: "Maintenance closed", log });
  } finally {
    session.endSession();
  }
});
