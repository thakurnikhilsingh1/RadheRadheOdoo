// Central place for enums shared across models, controllers, and validators.

const ROLES = ["Admin", "Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"];

const VEHICLE_STATUS = ["Available", "On Trip", "In Shop", "Retired"];

const DRIVER_STATUS = ["Available", "On Trip", "Off Duty", "Suspended"];

const TRIP_STATUS = ["Draft", "Dispatched", "Completed", "Cancelled"];

const MAINTENANCE_STATUS = ["Active", "Completed"];

module.exports = {
  ROLES,
  VEHICLE_STATUS,
  DRIVER_STATUS,
  TRIP_STATUS,
  MAINTENANCE_STATUS,
};
