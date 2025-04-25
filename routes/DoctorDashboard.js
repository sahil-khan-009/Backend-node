const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
// const Doctor = require("../models/DoctorSchema");
const Appointment = require("../models/Appointment");
// const Department = require("../models/DepartmentSchema");
const isdoctorLoggedin = require("../middlewares/isDocLoggedin");
// const Appointment = require("../models/Appointment");
// const upload = require("../middlewares/MulterConfig");
const upload = require(".config/multer");
const path = require("path");


router.get("/allAppointments", isdoctorLoggedin, async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    if (!doctorId) {
      return res.status(400).json({ message: "Doctor ID is required." });
    }

    const doctorAppointments = await Appointment.find({
      doctorId: doctorId,
      isDeleted: { $ne: true }, // Adjust based on your DB design
      appointmentStatus: { $ne: "pending" }, // Exclude pending appointments
    })
      .populate(
        "doctorId",
        "name email uniqueId patientName appointmentDate description mode"
      )
      .sort({ date: -1 });

    if (doctorAppointments.length === 0) {
      return res.status(404).json({ message: "No appointments found." });
    }

    return res.status(200).json({
      message: "Appointments fetched successfully",
      appointments: doctorAppointments,
    });
  } catch (err) {
    console.log("This is catch error", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Patient resport



router.post("/UploadUserReport/:appointmentId", isdoctorLoggedin, upload.single("image"), (err, req, res, next) => {
  if (err) {
    console.error("Multer upload error:", err);
    return res.status(500).send("Error during file upload.");
  }
  // Continue with the normal flow after handling errors
  next();
}, async (req, res) => {
  console.log("✅ File Received++++++++++++++++:", req.file);

  try {
    console.log("✅ File Received--------------------:", req.file);

    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;
    const filePath = `uploads/reports/${req.file.filename}`;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        $set: {
          report: filePath, // Store file path in DB
        },
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({
      message: "Report uploaded successfully",
      updatedAppointment,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});







// router.post("/UploadUserReport/:appointmentId",isdoctorLoggedin,upload.single("report"), async (req, res) => {
//   console.log("✅ File Received++++++++++++++++:", req.file);

//     try {
//       console.log("✅ File Received--------------------:", req.file);

//       const { appointmentId } = req.params;
//       const doctorId = req.doctor._id;
//       // const filePath = req.file.path; // this contains the full path to uploaded file
//       // const relativePath = `uploads/reports/${req.file.filename}`;
//       const filePath = `uploads/reports/${req.file.filename}`;

//       const updatedAppointment = await Appointment.findByIdAndUpdate(
//         appointmentId,
//         {
//           $set: {
//             report: filePath, // Store file path in DB
//           },
//         },
//         { new: true }
//       );

//       if (!updatedAppointment) {
//         return res.status(404).json({ message: "Appointment not found" });
//       }

//       res.status(200).json({
//         message: "Report uploaded successfully",
//         updatedAppointment,
//       });
//     } catch (err) {
//       console.error("Upload error:", err);
//       res.status(500).json({ message: "Something went wrong" });
//     }
//   }
// );


module.exports = router;
