const express = require("express");
const router = express.Router();

const {
    register,
    login,
    me
} = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { auth: authValidators } = require("../validators");


router.post("/register", authValidators.register, validate, register);

router.post("/login", authValidators.login, validate, login);

router.get("/me", requireAuth, me);


module.exports = router;