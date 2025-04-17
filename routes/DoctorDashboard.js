const express = require("express");
const router = express.Router();
// const Doctor = require("../models/DoctorSchema");
const Appointment = require("../models/Appointment");
// const Department = require("../models/DepartmentSchema");

router.get("/allAppointments", async (req, res) => {
    try {
      const appointments = await Appointment.find(
        { isDeleted: false }, // only fetch non-deleted appointments
        {
          appointmentStatus: 0,
          availability: 0,
          userId: 0,
          departmentId: 0,
          isDeleted:0,
          deletedAt:0,
          deletedBy:0,
          // appointmentDate:1
        }
      );
      res.status(200).json(appointments);
    } catch (err) {
      console.log("This is catch error", err.message);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;

