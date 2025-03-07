const express = require("express");
const router = express.Router();
const Doctor = require("../models/DoctorSchema");
const Department = require('../models/DepartmentSchema')
// Route to create a doctor
router.post("/Createdoctor", async (req, res) => {
  try {
    const { name, email, phone, uniqueId, availability, department } = req.body;
    console.log("Incoming Data------doctor:", req.body);

    // Check if department exists
    const existingDepartment = await Department.findById(department);
    if (!existingDepartment) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    // Create a new doctor instance
    const createdDoctor = new Doctor({
      name,
      email,
      phone,
      uniqueId,
      availability,
      department,
    });

    // Save the doctor to the database
    const savedDoctor = await createdDoctor.save();

    // Push doctor ID to the department's doctors array
    existingDepartment.doctors.push(savedDoctor._id);
    await existingDepartment.save();

    res.status(201).json({
      message: "Doctor created successfully",
      doctor: savedDoctor,
    });
  } catch (err) {
    console.error("Error in creating doctor:", err.message);

    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists." });
    }

    res.status(500).json({ error: err.message });
  }
});

router.get("/Department", async (req, res) => {
    try {
      // Fetch only specific fields: name, department, and availability
      const DoctorsDepartment = await Doctor.find({}, { "doctors.phone": 0 });

      console.log("Doctors' Name, Department, and Availability:", DoctorsDepartment);
  
      // Send the filtered data to the frontend
      res.status(200).json(DoctorsDepartment);
    } catch (err) {
      console.error("Error fetching doctors' data:", err.message);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  });
  
module.exports = router;
