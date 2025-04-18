const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
// const Doctor = require("../models/DoctorSchema");
const Appointment = require("../models/Appointment");
// const Department = require("../models/DepartmentSchema");
const isdoctorLoggedin = require("../middlewares/isDocLoggedin");

router.get("/allAppointments/",isdoctorLoggedin, async (req, res) => {
    try {
    // console.log("This is doctor id", req.doctorId);
    
    const hello =" kaisan ba"
      res.status(200).json({hello,
        doctorObj: req.doctor
      });
    } catch (err) {
      console.log("This is catch error", err.message);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;

