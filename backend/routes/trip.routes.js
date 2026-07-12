const express=require("express");

const router=express.Router();


const {
createTrip,
dispatchTrip,
completeTrip,
cancelTrip,
getTrips
}=require("../controllers/trip.controller");


const {requireAuth}=require("../middleware/auth");
const validate = require("../middleware/validate");
const { trip: tripValidators } = require("../validators");



router.get(
"/",
requireAuth,
getTrips
);



router.post(
"/",
requireAuth,
tripValidators.create,
validate,
createTrip
);



router.patch(
"/:id/dispatch",
requireAuth,
tripValidators.idParam,
validate,
dispatchTrip
);



router.patch(
"/:id/complete",
requireAuth,
tripValidators.idParam,
validate,
completeTrip
);



router.patch(
"/:id/cancel",
requireAuth,
tripValidators.idParam,
validate,
cancelTrip
);



module.exports=router;