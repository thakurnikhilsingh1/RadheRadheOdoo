const express=require("express");
const router=express.Router();


const {
createMaintenance,
closeMaintenance,
getMaintenance
}=require("../controllers/maintenance.controller");


const {requireAuth}=require("../middleware/auth");
const validate = require("../middleware/validate");
const { maintenance: maintenanceValidators } = require("../validators");



router.get(
"/",
requireAuth,
getMaintenance
);



router.post(
"/",
requireAuth,
maintenanceValidators.create,
validate,
createMaintenance
);



router.patch(
"/:id/close",
requireAuth,
maintenanceValidators.idParam,
validate,
closeMaintenance
);



module.exports=router;