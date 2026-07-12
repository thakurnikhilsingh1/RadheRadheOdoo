const Expense = require("../models/Expense");
const Vehicle = require("../models/Vehicle");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

exports.getExpenses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.vehicle_id) filter.vehicle_id = req.query.vehicle_id;

  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json(expenses);
});

exports.addExpense = asyncHandler(async (req, res) => {
  const { vehicle_id, expense_type, amount, description, date } = req.body;

  const vehicle = await Vehicle.findById(vehicle_id);
  if (!vehicle) throw ApiError.notFound("Vehicle not found");

  const expense = await Expense.create({ vehicle_id, expense_type, amount, description, date });
  res.status(201).json(expense);
});
