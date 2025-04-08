const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/DoctorSchema");
const Users = require("../models/Users");
const router = express.Router();
const isLoggedIn = require("../middlewares/IsLoggedin");
const mongoose = require("mongoose");

//POST API
router.post("/appointments", isLoggedIn, async (req, res) => {
  try {
    console.log("req.body================", req.body);
    const doctorId = req.body.doctorId;
    console.log("doctorId----------", doctorId);

    // const existingAppointment = await Appointment.findOne({ patientemail: req.body.patientemail });
    // if (existingAppointment) {
    //   return res.status(400).json({ message: "Email already exists" });
    // }

    const appointment = new Appointment({ ...req.body, userId: req.user._id }); //

    // console.log("userId: req.user._id-----------------",req.user._id)
    // console.log("appointment-----Created",appointment);
    // console.log("user------>", req.user);
    const savedAppointment = await appointment.save();
    res.status(201).json({
      message: "Appointment requested successfully",
      appointment: savedAppointment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET API ()
router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.aggregate([
      { $sort: { appointmentDate: 1 } }, // ✅ Corrected $sort syntax

      { $match: { isDeleted: false } }, // ✅ Ensure only non-deleted appointments

      {
        $lookup: {
          from: "doctors", // ✅ Ensure this matches your DB collection name
          localField: "doctorId",
          foreignField: "_id",
          as: "doctorDetails",
        },
      },
      { $unwind: "$doctorDetails" }, // ✅ Convert array to object

      {
        $lookup: {
          from: "departments", // ✅ Ensure this matches your DB collection name
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      { $unwind: "$departmentDetails" },

      {
        $project: {
          _id: 1,
          patientName: 1,
          patientemail: 1,
          appointmentDate: 1,
          appointmentStatus: 1,
          doctorName: "$doctorDetails.name", // ✅ Fetching doctor's name
          doctorEmail: "$doctorDetails.email", // ✅ Fetching doctor's email
          department: "$departmentDetails.name", // ✅ Fetching department name
        },
      },
    ]);

 router.get('/totalAppointments', async (req, res) => {

  try{
    const totalAppointments = await  Appointment.find({})

    res.status(200).json({
      totalAppointments,
    });

  }catch(err){
    console.error("Error fetching total appointments:", err.message);
    return res.status(500).json({ error: err.message });
  }
 })


    return res.status(200).json(appointments);
  } catch (err) {
    console.log("this is catch error", err.message);
    return res.status(500).json({
      Error: "Internal server error",
      err: err.message,
    });
  }
});



//Get Api
router.get("/LoggedInUserName", async (req, res) => {
  try {
    const userName = await Users.findById(req.user._id).select("userName");
    if (!userName) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("userName--------------------", userName);
    res.status(200).json({ userName: userName.userName });
  } catch (err) {
    console.log("This is catch error", err.message);
    res.status(500).json({ error: err.message });
  }
});


// UPDATE API

router.put("/updateAppointment/:id", async (req, res) => {
  try {
    console.log("req.body================", req.body);
    const id = req.params.id;
    console.log("It is Post Id=====", id);
    let {
      patientName,
      doctorName,
      appointmentDate,
      description,
      patientemail,
      departmentId,
      doctorId,
      availability,
    } = req.body;

    let update = await Appointment.findByIdAndUpdate(
      id,
      {
        patientName,
        doctorName,
        appointmentDate,
        description,
        patientemail,
        departmentId,
        doctorId,
        availability,
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

// DELETE API

router.delete("/deleteAppointment/:id", isLoggedIn, async (req, res) => {
  try {
    const id = req.params.id;

    console.log("ID received in delete route:", id);
    console.log("req.user._id----------------------", req.user._id);

    if (!id) {
      //Check if ID is present
      return res.status(400).json({ error: "Appointment ID is required" });
    }

    // Check if appointment exists and mark it as deleted
    const deleteAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user ? req.user._id : null, // Ensure req.user exists
        },
      },
      { new: true } // Returns the updated document
    );

    if (!deleteAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    console.log("Appointment deleted successfully:", deleteAppointment);
    return res
      .status(200)
      .json({
        message: "Appointment deleted successfully",
        data: deleteAppointment,
      });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

// GET API
// router.get("/appointments", async (req, res) => {
//   try {
//     const appointments = await Appointment.aggregate([
//       {
//         $match: { isDeleted: false }
//       }  ,
//       // Lookup for department details
//       {
//         $lookup: {
//           from: "doctors",
//           localField: "doctorId",
//           foreignField: "_id",
//           as: "DoctorDetails",
//         },
//       },
//       {
//         $unwind: {
//           path: "$DoctorDetails",
//           preserveNullAndEmptyArrays: true,
//         },
//       },

//       // Lookup for doctor details inside the array
//       {
//         $lookup: {
//           from: "departments",
//           let: { doctorId: "$doctorId" }, // Passing doctorId
//           pipeline: [
//             { $unwind: "$doctors" }, // Unwind the doctors array
//             { $match: { $expr: { $eq: ["$doctors._id", "$$doctorId"] } } }, // Match doctor inside the array
//             {
//               $project: {
//                 // Select only necessary fields
//                 name: "$doctors.name",
//                 email: "$doctors.email",
//                 phone: "$doctors.phone",
//                 availability: "$doctors.availability",
//               },
//             },
//           ],
//           as: "doctorDetails",
//         },
//       },
//       {
//         $unwind: { path: "$doctorDetails", preserveNullAndEmptyArrays: true },
//       },

//       // Final projection
//       {
//         $project: {
//           _id: 1,
//           patientName: 1,
//           patientemail: 1,
//           appointmentDate: 1,
//           description: 1,
//           appointmentStatus: 1,
//           department: "$departmentDetails.department",
//           doctor: "$doctorDetails",
//         },
//       },
//     ]);

//     res.status(200).json(appointments);
//   } catch (err) {
//     console.error("Error fetching appointments:", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });
