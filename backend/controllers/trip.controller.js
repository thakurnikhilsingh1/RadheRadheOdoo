/* Handles trip lifecycle: Draft -> Dispatched -> Completed | Cancelled.
 *
 * The original Postgres implementation enforced these rules with database
 * triggers. MongoDB has no equivalent, so the same rules are enforced here in
 * the application layer, wrapped in a transaction so a trip's status and its
 * vehicle/driver status always move together. Multi-document transactions
 * require MongoDB to be running as a replica set (Atlas clusters are, by
 * default, even on the free tier).
 */
const mongoose = require("mongoose");
const Trip = require("../models/Trip");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function serializeTrip(trip) {
  const json = trip.toJSON();
  if (trip.vehicle_id && trip.vehicle_id.vehicle_name !== undefined) {
    json.vehicle_id = trip.vehicle_id._id.toString();
    json.vehicle_name = trip.vehicle_id.vehicle_name;
  }
  if (trip.driver_id && trip.driver_id.name !== undefined) {
    json.driver_id = trip.driver_id._id.toString();
    json.driver_name = trip.driver_id.name;
  }
  return json;
}

exports.getTrips = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const trips = await Trip.find(filter)
    .sort({ created_at: -1 })
    .populate("vehicle_id", "vehicle_name")
    .populate("driver_id", "name");

  res.json(trips.map(serializeTrip));
});

exports.createTrip = asyncHandler(async (req, res) => {
  const { source, destination, vehicle_id, driver_id, cargo_weight, planned_distance } = req.body;

  const vehicle = await Vehicle.findById(vehicle_id);
  if (!vehicle) throw ApiError.notFound("Vehicle not found");

  if (vehicle.status !== "Available") {
    throw ApiError.badRequest(`Vehicle is not available (current status: ${vehicle.status})`);
  }

  if (Number(cargo_weight) > Number(vehicle.max_load_capacity)) {
    throw ApiError.badRequest("Cargo weight exceeds vehicle maximum capacity");
  }

  const driver = await Driver.findById(driver_id);
  if (!driver) throw ApiError.notFound("Driver not found");

  if (driver.status !== "Available") {
    throw ApiError.badRequest(`Driver is not available (current status: ${driver.status})`);
  }

  if (driver.license_expiry_date && driver.license_expiry_date < new Date()) {
    throw ApiError.badRequest("Driver license has expired");
  }

  const trip = await Trip.create({
    source,
    destination,
    vehicle_id,
    driver_id,
    cargo_weight,
    planned_distance,
  });

  res.status(201).json(trip);
});

async function withTransaction(work) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    session.endSession();
  }
}

exports.dispatchTrip = asyncHandler(async (req, res) => {
  const result = await withTransaction(async (session) => {
    const trip = await Trip.findById(req.params.id).session(session);
    if (!trip) throw ApiError.notFound("Trip not found");
    if (trip.status !== "Draft") {
      throw ApiError.badRequest(`Trip cannot be dispatched from status '${trip.status}'`);
    }

    const vehicle = await Vehicle.findById(trip.vehicle_id).session(session);
    const driver = await Driver.findById(trip.driver_id).session(session);
    if (!vehicle || vehicle.status !== "Available") {
      throw ApiError.badRequest("Vehicle is no longer available");
    }
    if (!driver || driver.status !== "Available") {
      throw ApiError.badRequest("Driver is no longer available");
    }

    trip.status = "Dispatched";
    trip.dispatched_at = new Date();
    vehicle.status = "On Trip";
    driver.status = "On Trip";

    await trip.save({ session });
    await vehicle.save({ session });
    await driver.save({ session });

    return trip;
  });

  res.json({ message: "Trip dispatched", trip: result });
});

exports.completeTrip = asyncHandler(async (req, res) => {
  const { final_odometer, fuel_consumed_liters } = req.body || {};

  const result = await withTransaction(async (session) => {
    const trip = await Trip.findById(req.params.id).session(session);
    if (!trip) throw ApiError.notFound("Trip not found");
    if (trip.status !== "Dispatched") {
      throw ApiError.badRequest(`Trip cannot be completed from status '${trip.status}'`);
    }

    trip.status = "Completed";
    trip.completed_at = new Date();
    if (final_odometer !== undefined) trip.final_odometer = final_odometer;
    if (fuel_consumed_liters !== undefined) trip.fuel_consumed_liters = fuel_consumed_liters;
    await trip.save({ session });

    await Vehicle.findByIdAndUpdate(trip.vehicle_id, { status: "Available" }, { session });
    await Driver.findByIdAndUpdate(trip.driver_id, { status: "Available" }, { session });

    return trip;
  });

  res.json({ message: "Trip completed", trip: result });
});

exports.cancelTrip = asyncHandler(async (req, res) => {
  const result = await withTransaction(async (session) => {
    const trip = await Trip.findById(req.params.id).session(session);
    if (!trip) throw ApiError.notFound("Trip not found");
    if (!["Draft", "Dispatched"].includes(trip.status)) {
      throw ApiError.badRequest(`Trip cannot be cancelled from status '${trip.status}'`);
    }

    const wasDispatched = trip.status === "Dispatched";
    trip.status = "Cancelled";
    trip.cancelled_at = new Date();
    await trip.save({ session });

    if (wasDispatched) {
      await Vehicle.findByIdAndUpdate(trip.vehicle_id, { status: "Available" }, { session });
      await Driver.findByIdAndUpdate(trip.driver_id, { status: "Available" }, { session });
    }

    return trip;
  });

  res.json({ message: "Trip cancelled", trip: result });
});
