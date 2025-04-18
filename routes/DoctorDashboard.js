const express = require("express");
const mongoose = require('mongoose');
const router = express.Router();
// const Doctor = require("../models/DoctorSchema");
const Appointment = require("../models/Appointment");
// const Department = require("../models/DepartmentSchema");
const isdoctorLoggedin = require("../middlewares/isDocLoggedin");

router.get("/allAppointments", isdoctorLoggedin, async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required." });
    }

    const doctorAppointments = await Appointment.find({ 
      doctorId: doctorId, 
      isDeleted: { $ne: true } // Adjust based on your DB design
    })
      .populate("doctorId", "name email uniqueId patientName appointmentDate description mode")
      .sort({ date: -1 });

    if (doctorAppointments.length === 0) {
      return res.status(404).json({ message: "No appointments found." });
    }

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments: doctorAppointments
    });

  } catch (err) {
    console.log("This is catch error", err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

