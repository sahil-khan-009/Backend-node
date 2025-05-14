const express = require("express");
const { registerUser } = require("../controllers/AuthController");
const { loginUser } = require("../controllers/AuthController");
const {logout} = require('../controllers/AuthController');
const {ForgetPassword} = require('../controllers/AuthController');
const {ResetPassword} = require('../controllers/AuthController');
const {loginDoctor} = require('../controllers/AuthController');
// const {trackEvent}  = require('../controllers/analytics')
// const {sendGAEvent} = require('../controllers/analytics')
// Adjust path if needed
const router = express.Router();

// !!! attention !!! !!! !!!  the name must be AuthController but but some problem i am naming it as SecurityRoutes

// Define POST route for registration
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/logout', logout)
router.post('/ForgetPassword',ForgetPassword);
router.post('/ResetPassword',ResetPassword);
router.post('/loginDoctor',loginDoctor);


module.exports = router;