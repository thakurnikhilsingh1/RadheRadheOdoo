const express=require("express");
const router=express.Router();


const {
getDrivers,
createDriver,
updateDriver,
deleteDriver
}=require("../controllers/driver.controller");


const {requireAuth, requireRole}=require("../middleware/auth");
const validate = require("../middleware/validate");
const { driver: driverValidators } = require("../validators");


router.get(
"/",
requireAuth,
getDrivers
);


router.post(
"/",
requireAuth,
requireRole("Fleet Manager", "Admin"),
driverValidators.create,
validate,
createDriver
);


router.put(
"/:id",
requireAuth,
requireRole("Fleet Manager", "Admin"),
driverValidators.update,
validate,
updateDriver
);


router.delete(
"/:id",
requireAuth,
requireRole("Fleet Manager", "Admin"),
driverValidators.idParam,
validate,
deleteDriver
);


module.exports=router;