/*
 * Seeds the MongoDB database with demo data equivalent to the old seed.sql.
 * Run with: npm run seed
 *
 * Safe to re-run — it upserts by natural unique key (email / registration
 * number / license number) instead of blindly inserting duplicates.
 */
require("dotenv").config();
const bcrypt = require("bcrypt");
const { connectDB, disconnectDB } = require("../config/db");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");
const MaintenanceLog = require("../models/MaintenanceLog");
const FuelLog = require("../models/FuelLog");
const Expense = require("../models/Expense");

const DEMO_PASSWORD = "Passw0rd!";

async function upsertUser(data) {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  return User.findOneAndUpdate(
    { email: data.email },
    { ...data, password },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertVehicle(data) {
  return Vehicle.findOneAndUpdate({ registration_number: data.registration_number }, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
}

async function upsertDriver(data) {
  return Driver.findOneAndUpdate({ license_number: data.license_number }, data, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
}

async function run() {
  await connectDB();

  console.log("Seeding users...");
  await upsertUser({ name: "Admin User", email: "admin@transitops.com", role_name: "Admin" });
  await upsertUser({ name: "Fleet Manager", email: "fleet@transitops.com", role_name: "Fleet Manager" });
  console.log(`   Demo password for all seeded users: ${DEMO_PASSWORD}`);

  console.log("Seeding vehicles...");
  const vanTata = await upsertVehicle({
    registration_number: "UP16AB1234",
    vehicle_name: "Tata Ace",
    vehicle_type: "Mini Truck",
    max_load_capacity: 750,
    odometer: 20000,
    acquisition_cost: 600000,
    status: "Available",
  });
  const truckAshok = await upsertVehicle({
    registration_number: "DL01XY5678",
    vehicle_name: "Ashok Leyland Dost",
    vehicle_type: "Truck",
    max_load_capacity: 1500,
    odometer: 45000,
    acquisition_cost: 1200000,
    status: "Available",
  });
  const pickupMahindra = await upsertVehicle({
    registration_number: "UP14CD7890",
    vehicle_name: "Mahindra Bolero",
    vehicle_type: "Pickup",
    max_load_capacity: 1000,
    odometer: 30000,
    acquisition_cost: 900000,
    status: "In Shop",
  });

  console.log("Seeding drivers...");
  const rahul = await upsertDriver({
    name: "Rahul Sharma",
    license_number: "DL123456",
    license_category: "Heavy Vehicle",
    license_expiry_date: new Date("2027-12-31"),
    contact_number: "9876543210",
    safety_score: 90,
    status: "Available",
  });
  const amit = await upsertDriver({
    name: "Amit Kumar",
    license_number: "DL789012",
    license_category: "Commercial",
    license_expiry_date: new Date("2026-10-31"),
    contact_number: "9876501234",
    safety_score: 85,
    status: "Available",
  });
  await upsertDriver({
    name: "Ravi Singh",
    license_number: "DL345678",
    license_category: "Heavy Vehicle",
    license_expiry_date: new Date("2025-01-01"),
    contact_number: "9876540000",
    safety_score: 70,
    status: "Suspended",
  });

  console.log("Seeding trips...");
  if ((await Trip.countDocuments({})) === 0) {
    await Trip.create([
      {
        source: "Mathura",
        destination: "Delhi",
        vehicle_id: vanTata._id,
        driver_id: rahul._id,
        cargo_weight: 500,
        planned_distance: 180,
        status: "Draft",
      },
      {
        source: "Agra",
        destination: "Noida",
        vehicle_id: truckAshok._id,
        driver_id: amit._id,
        cargo_weight: 1000,
        planned_distance: 220,
        status: "Draft",
      },
    ]);
  }

  console.log("Seeding maintenance logs...");
  if ((await MaintenanceLog.countDocuments({})) === 0) {
    await MaintenanceLog.create({
      vehicle_id: pickupMahindra._id,
      maintenance_type: "Engine Service",
      description: "Engine oil and filter replacement",
      cost: 15000,
      start_date: new Date(),
      status: "Active",
    });
  }

  console.log("Seeding fuel logs...");
  if ((await FuelLog.countDocuments({})) === 0) {
    await FuelLog.create([
      { vehicle_id: vanTata._id, liters: 50, cost: 5000, distance: 180 },
      { vehicle_id: truckAshok._id, liters: 70, cost: 7000, distance: 250 },
    ]);
  }

  console.log("Seeding expenses...");
  if ((await Expense.countDocuments({})) === 0) {
    await Expense.create([
      { vehicle_id: vanTata._id, expense_type: "Toll", amount: 500, description: "Highway toll charges" },
      { vehicle_id: truckAshok._id, expense_type: "Repair", amount: 3000, description: "Minor repair" },
    ]);
  }

  console.log("✅ Seed complete");
  await disconnectDB();
  process.exit(0);
}

run().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
