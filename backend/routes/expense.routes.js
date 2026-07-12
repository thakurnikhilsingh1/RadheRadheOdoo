const express=require("express");
const router=express.Router();


const {
addExpense,
getExpenses
}=require("../controllers/expense.controller");


const {requireAuth}=require("../middleware/auth");
const validate = require("../middleware/validate");
const { expense: expenseValidators } = require("../validators");



router.get(
"/",
requireAuth,
getExpenses
);



router.post(
"/",
requireAuth,
expenseValidators.create,
validate,
addExpense
);



module.exports=router;