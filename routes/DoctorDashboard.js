const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
// const Doctor = require("../models/DoctorSchema");
const Appointment = require("../models/Appointment");
const doctor = require("../models/DoctorSchema");
const isLoggedIn = require("../middlewares/IsLoggedin");
// const Department = require("../models/DepartmentSchema");

router.get("/allAppointments/", isLoggedIn, async (req, res) => {
    try {
      // const id = '67cd58ac44384dfc0993323b';
      // const appointments = await Appointment.find(
      //   {doctorId: new mongoose.Types.ObjectId(id) ,
      //      isDeleted: false }, // only fetch non-deleted appointments
      //   {
      //     appointmentStatus: 0,
      //     availability: 0,
      //     userId: 0,
      //     departmentId: 0,
      //     isDeleted:0,
      //     deletedAt:0,
      //     deletedBy:0,
      //     // appointmentDate:1

      const appointments = await doctor.find({});
        
      res.status(200).json(appointments);
    } catch (err) {
      console.log("This is catch error", err.message);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;

