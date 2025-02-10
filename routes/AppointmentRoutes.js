const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/DoctorSchema");
const router = express.Router();
const isLoggedIn = require('../middlewares/IsLoggedin');
const mongoose = require('mongoose');

router.post("/appointments", isLoggedIn, async (req, res) => {
  try {
    
    console.log("req.body================",req.body);
    const doctorId = req.body.doctorId;
    console.log("doctorId----------",doctorId)

  
    const appointment = new Appointment({ ...req.body, userId: req.user._id}); //
    
// console.log("userId: req.user._id-----------------",req.user._id)
    // console.log("appointment-----Created",appointment);
    // console.log("user------>", req.user);
    const savedAppointment = await appointment.save();
    res.status(201).json({
      message: "Appointment requested successfully",
      appointment: savedAppointment,
    });
  } catch (err) {
    res.status(500).json({  error: err.message });
  }
});


//get user appointment status
// router.get("/appointments", isLoggedIn, async (req, res) => {
  router.get("/appointments/:departmentId", isLoggedIn, async (req, res) => {
    try {
      const { departmentId } = req.params;
      console.log("Department ID:", departmentId);
  
      if (!mongoose.Types.ObjectId.isValid(departmentId)) {
        return res.status(400).json({ error: "Invalid Department ID format" });
      }
  
      const appointments = await Appointment.find({
        userId: req.user._id,
        departmentId: new mongoose.Types.ObjectId(departmentId),
      })
        .populate("userId", "userName userEmail role")
        .populate("departmentId", "department doctors.name doctors.email doctors.phone doctors.availability");
  
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
      res.status(500).json({ error: err.message });
    }
  });
   


router.put("/updateAppointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('It is Post Id=====',id)
    let { patientName, doctorName, appointmentDate, description ,patientemail} = req.body;

    let update = await Appointment.findByIdAndUpdate(
       id ,
      {
        patientName,
        doctorName,
        appointmentDate,
        description,
        patientemail
        
      },
      { new: true } // return the updatedAppointmentd document
    );
    if (!update) {
      return res.status(404).json({ err: "Appontment Not Found" });
    }

    res.status(200).json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/deleteAppointment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('that is the id of Delete Route--------',id)

    // Check if the appointment exists
    const deleteAppointment = await Appointment.findByIdAndDelete(id);

    if (!deleteAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    console.log('Appointment deleted successfully');
    return res.status(200).json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
    
  }
 
});


module.exports = router;
