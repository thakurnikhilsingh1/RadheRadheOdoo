const express = require("express");
const router = express.Router();

const {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} = require("../controllers/vehicle.controller");

const {requireAuth, requireRole}=require("../middleware/auth");
const validate = require("../middleware/validate");
const { vehicle: vehicleValidators } = require("../validators");


// View vehicles
router.get(
"/",
requireAuth,
getVehicles
);


// Single vehicle
router.get(
"/:id",
requireAuth,
vehicleValidators.idParam,
validate,
getVehicleById
);


// Add vehicle
router.post(
"/",
requireAuth,
requireRole("Fleet Manager", "Admin"),
vehicleValidators.create,
validate,
createVehicle
);


// Update vehicle
router.put(
"/:id",
requireAuth,
requireRole("Fleet Manager", "Admin"),
vehicleValidators.update,
validate,
updateVehicle
);


// Retire vehicle
router.delete(
"/:id",
requireAuth,
requireRole("Fleet Manager", "Admin"),
vehicleValidators.idParam,
validate,
deleteVehicle
);


module.exports=router;