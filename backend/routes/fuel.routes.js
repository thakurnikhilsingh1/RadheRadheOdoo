const express=require("express");
const router=express.Router();


const {
addFuelLog,
getFuelLogs
}=require("../controllers/fuel.controller");


const {requireAuth}=require("../middleware/auth");
const validate = require("../middleware/validate");
const { fuel: fuelValidators } = require("../validators");



router.get(
"/",
requireAuth,
getFuelLogs
);



router.post(
"/",
requireAuth,
fuelValidators.create,
validate,
addFuelLog
);



module.exports=router;