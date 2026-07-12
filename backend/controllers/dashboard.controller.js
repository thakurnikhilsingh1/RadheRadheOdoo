/*
KPIs:

Active vehicles
Available vehicles
Active trips
Fleet utilization
Operational cost
*/
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");
const MaintenanceLog = require("../models/MaintenanceLog");
const asyncHandler = require("../utils/asyncHandler");

exports.getDashboard = asyncHandler(async (req, res) => {
  const [totalVehicles, availableVehicles, activeTrips, fuelCostAgg, maintenanceCostAgg, expenseCostAgg] =
    await Promise.all([
      Vehicle.countDocuments({}),
      Vehicle.countDocuments({ status: "Available" }),
      Trip.countDocuments({ status: "Dispatched" }),
      FuelLog.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]),
      MaintenanceLog.aggregate([{ $group: { _id: null, total: { $sum: "$cost" } } }]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

  const fuelCost = fuelCostAgg[0]?.total || 0;
  const maintenanceCost = maintenanceCostAgg[0]?.total || 0;
  const otherExpenses = expenseCostAgg[0]?.total || 0;

  res.json({
    totalVehicles,
    availableVehicles,
    activeTrips,
    fleetUtilization: totalVehicles > 0 ? Number((((totalVehicles - availableVehicles) / totalVehicles) * 100).toFixed(1)) : 0,
    fuelCost,
    maintenanceCost,
    otherExpenses,
    operationalCost: fuelCost + maintenanceCost + otherExpenses,
  });
});

exports.exportCSV = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find({}).sort({ created_at: -1 });

  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  let csv = "id,registration_number,vehicle_name,status\n";
  vehicles.forEach((v) => {
    csv += `${escape(v.id)},${escape(v.registration_number)},${escape(v.vehicle_name)},${escape(v.status)}\n`;
  });

  res.header("Content-Type", "text/csv");
  res.header("Content-Disposition", "attachment; filename=vehicles.csv");
  res.send(csv);
});
