const FuelLog = require("../models/FuelLog");
const Vehicle = require("../models/Vehicle");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getFuelLogs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.vehicle_id) filter.vehicle_id = req.query.vehicle_id;

  const logs = await FuelLog.find(filter).sort({ date: -1 });
  res.json(logs);
});

exports.addFuelLog = asyncHandler(async (req, res) => {
  const { vehicle_id, liters, cost, distance, date } = req.body;

  const vehicle = await Vehicle.findById(vehicle_id);
  if (!vehicle) throw ApiError.notFound("Vehicle not found");

  const log = await FuelLog.create({ vehicle_id, liters, cost, distance, date });
  res.status(201).json(log);
});
