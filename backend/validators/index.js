const { body, param } = require("express-validator");
const { ROLES, VEHICLE_STATUS, DRIVER_STATUS } = require("../utils/constants");

const isMongoId = (field) => param(field).isMongoId().withMessage(`${field} must be a valid id`);

const auth = {
  register: [
    body("name").trim().notEmpty().withMessage("name is required").isLength({ max: 100 }),
    body("email").trim().isEmail().withMessage("a valid email is required").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("password must be at least 6 characters"),
    body("role_name").optional().isIn(ROLES).withMessage(`role_name must be one of: ${ROLES.join(", ")}`),
  ],
  login: [
    body("email").trim().isEmail().withMessage("a valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("password is required"),
  ],
};

const vehicle = {
  create: [
    body("registration_number").trim().notEmpty().withMessage("registration_number is required"),
    body("vehicle_name").optional({ nullable: true }).trim().isLength({ max: 100 }),
    body("vehicle_type").optional({ nullable: true }).trim().isLength({ max: 50 }),
    body("max_load_capacity").isFloat({ gt: 0 }).withMessage("max_load_capacity must be greater than 0"),
    body("odometer").optional().isFloat({ min: 0 }),
    body("acquisition_cost").optional().isFloat({ min: 0 }),
  ],
  update: [
    isMongoId("id"),
    body("vehicle_name").optional({ nullable: true }).trim().isLength({ max: 100 }),
    body("vehicle_type").optional({ nullable: true }).trim().isLength({ max: 50 }),
    body("odometer").optional().isFloat({ min: 0 }),
    body("acquisition_cost").optional().isFloat({ min: 0 }),
    body("status").optional().isIn(VEHICLE_STATUS).withMessage(`status must be one of: ${VEHICLE_STATUS.join(", ")}`),
  ],
  idParam: [isMongoId("id")],
};

const driver = {
  create: [
    body("name").trim().notEmpty().withMessage("name is required"),
    body("license_number").trim().notEmpty().withMessage("license_number is required"),
    body("license_category").optional({ nullable: true }).trim(),
    body("license_expiry_date").isISO8601().withMessage("license_expiry_date must be a valid date"),
    body("contact_number").optional({ nullable: true }).trim(),
    body("safety_score").optional().isInt({ min: 0, max: 100 }),
  ],
  update: [
    isMongoId("id"),
    body("status").optional().isIn(DRIVER_STATUS).withMessage(`status must be one of: ${DRIVER_STATUS.join(", ")}`),
    body("safety_score").optional().isInt({ min: 0, max: 100 }),
  ],
  idParam: [isMongoId("id")],
};

const trip = {
  create: [
    body("source").trim().notEmpty().withMessage("source is required"),
    body("destination").trim().notEmpty().withMessage("destination is required"),
    body("vehicle_id").isMongoId().withMessage("vehicle_id must be a valid id"),
    body("driver_id").isMongoId().withMessage("driver_id must be a valid id"),
    body("cargo_weight").isFloat({ gt: 0 }).withMessage("cargo_weight must be greater than 0"),
    body("planned_distance").optional().isFloat({ gt: 0 }),
  ],
  idParam: [isMongoId("id")],
};

const maintenance = {
  create: [
    body("vehicle_id").isMongoId().withMessage("vehicle_id must be a valid id"),
    body("maintenance_type").optional({ nullable: true }).trim(),
    body("description").optional({ nullable: true }).trim(),
    body("cost").optional().isFloat({ min: 0 }),
    body("start_date").isISO8601().withMessage("start_date must be a valid date"),
  ],
  idParam: [isMongoId("id")],
};

const fuel = {
  create: [
    body("vehicle_id").isMongoId().withMessage("vehicle_id must be a valid id"),
    body("liters").isFloat({ gt: 0 }).withMessage("liters must be greater than 0"),
    body("cost").isFloat({ min: 0 }).withMessage("cost must be >= 0"),
    body("distance").optional().isFloat({ min: 0 }),
    body("date").optional().isISO8601(),
  ],
};

const expense = {
  create: [
    body("vehicle_id").isMongoId().withMessage("vehicle_id must be a valid id"),
    body("expense_type").optional({ nullable: true }).trim(),
    body("amount").isFloat({ min: 0 }).withMessage("amount must be >= 0"),
    body("description").optional({ nullable: true }).trim(),
    body("date").optional().isISO8601(),
  ],
};

module.exports = { auth, vehicle, driver, trip, maintenance, fuel, expense };
