const express = require("express");
const router = express.Router();
const Doctor = require("../models/DoctorSchema");
const Department = require('../models/DepartmentSchema')
// Route to create a doctor



router.post("/Createdoctor", async (req, res) => {
  try {
    const { name, email, phone, uniqueId, availability, department ,start,end} = req.body;

    console.log("Incoming Data------doctor:", req.body);

    // Validate email is provided
    if (!name || !email || !phone || !department || !availability) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Check if department exists
    const existingDepartment = await Department.findById(department);
    if (!existingDepartment) {
      return res.status(400).json({ error: "Invalid department ID" });
    }

    // Check if email already exists in doctors collection
    const emailExists = await Doctor.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Create a new doctor instance
    const createdDoctor = new Doctor({
      name,
      email,
      phone,
      uniqueId,
      availability,
      timings: { start, end }, // Store common timing
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




//<--------------------------------- Get Api of Doctors------------------------>
router.get('/Alldoctors', async (req, res) => {
  try {
    const Alldoctor = await Doctor.find({}, { _id: 1, department: 0 }); // Use `await` and correct projection syntax

    res.status(200).json(Alldoctor); // Use `json()` to send a proper response
  } catch (err) {
    console.log("This is a catch error:", err.message);
    res.status(500).json({ error: err.message });
  }
});



router.patch('/video/appointments/status/:id', async (req, res) => {
  console.log("Route hit hua bhai khus ho jaaaaaaaaaaaa")
  res.send("Hello from the video appointment status r0oute");

})

// router.get("/Department", async (req, res) => {
//     try {
//       // Fetch only specific fields: name, department, and availability
//       const DoctorsDepartment = await Doctor.find({}, { "doctors.phone": 0 });

//       console.log("Doctors' Name, Department, and Availability:", DoctorsDepartment);
  
//       // Send the filtered data to the frontend
//       res.status(200).json(DoctorsDepartment);
//     } catch (err) {
//       console.error("Error fetching doctors' data:", err.message);
//       res.status(500).json({ error: "Failed to fetch data" });
//     }
//   });
  
module.exports = router;
