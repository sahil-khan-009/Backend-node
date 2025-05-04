const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/DoctorSchema");
const Users = require("../models/Users");
const router = express.Router();
const isLoggedIn = require("../middlewares/IsLoggedin");
const loginDoctor = require("../middlewares/IsLoggedin");
const mongoose = require("mongoose");

//POST API
router.post("/appointments", isLoggedIn, async (req, res) => {
  try {
    console.log("req.body================", req.body);
    const { appointmentDate, doctorId, mode } = req.body;

    if (mode === "") {
      return res
        .status(400)
        .json({ message: "Please select mode of appointment" });
    }

    const selectedDate = new Date(appointmentDate);
    const selectedDay = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    }); // e.g., "Wednesday"

    // Step 1: Fetch doctor and check availability
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found." });
    }

    if (!doctor.availability.includes(selectedDay)) {
      return res.status(400).json({
        message: `Doctor is not available on ${selectedDay}. Please select another date.`,
      });
    }

    // Step 2: Check if doctor already has 15 appointments on this date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointmentCount = await Appointment.countDocuments({
      doctorId,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
    });

    if (appointmentCount >= 15) {
      return res.status(400).json({
        message:
          "Doctor is fully booked for this day. Please choose another doctor or date.",
      });
    }

    // ✅ All good: Save appointment
    const appointment = new Appointment({
      ...req.body,
      userId: req.user._id,
    });

    const savedAppointment = await appointment.save();

    res.status(201).json({
      message: "Appointment created successfully.",
      appointment: savedAppointment,
    });
  } catch (err) {
    console.error("Appointment error:", err);
    res.status(500).json({ error: err.message });
  }
});

// router.post("/appointments", isLoggedIn, async (req, res) => {
//   try {
//     console.log("req.body================", req.body);
//     // const doctorId = req.body.doctorId;
//     const {appointmentDate, doctorId} = req.body;

//     const startOfDay = new Date(appointmentDate);
//     startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
//     const endOfDay = new Date(appointmentDate);
//     endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

//     const appointmentCount = await Appointment.countDocuments({
//       appointmentDate: { $gte: startOfDay, $lte: endOfDay },
//       isDeleted: false, // Ignore deleted appointments
//     });

//     // const existingAppointment = await Appointment.findOne({ patientemail: req.body.patientemail });
//     // if (existingAppointment) {
//     //   return res.status(400).json({ message: "Email already exists" });
//     // }

//     const appointment = new Appointment({ ...req.body, userId: req.user._id }); //

//     // console.log("userId: req.user._id-----------------",req.user._id)
//     // console.log("appointment-----Created",appointment);
//     // console.log("user------>", req.user);
//     const savedAppointment = await appointment.save();
//     res.status(201).json({
//       message: "Appointment requested successfully",
//       appointment: savedAppointment,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// GET API ()
// dashborad user dashborad api
router.get("/AlluserAppointment", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(500).json({ message: "userId is undefined" });
    }

    console.log(
      "this is userId when get user appointment in appointmentstatus",
      userId
    );
    const appointments = await Appointment.find({
      userId,
    })
      .populate(
        "doctorId",
        "name email uniqueId patientName appointmentDate description mode"
      )
      .populate("departmentId", "name")
      .lean();

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    }

    return res.status(200).json({ appointments });
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/appointments", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(500).json({ message: "userId is undefined" });
    }

    console.log(
      "this is userId when get user appointment in appointmentstatus",
      userId
    );
    const appointments = await Appointment.find({
      userId,
      isDeleted: false,
    })
      .populate(
        "doctorId",
        "name email uniqueId patientName appointmentDate description mode"
      )
      .populate("departmentId", "name")
      .lean();

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found" });
    }

    // const appointments = await Appointment.aggregate([
    //   {
    //     $match: {
    //       isDeleted: false,
    //       userId: new mongoose.Types.ObjectId(userId), // ✅ Matching logged-in user's appointments
    //     },
    //   },
    //   { $sort: { appointmentDate: 1 } },

    //   {
    //     $lookup: {
    //       from: "doctors",
    //       localField: "doctorId",
    //       foreignField: "_id",
    //       as: "doctorDetails",
    //     },
    //   },
    //   { $unwind: "$doctorDetails" },

    //   {
    //     $lookup: {
    //       from: "departments",
    //       localField: "departmentId",
    //       foreignField: "_id",
    //       as: "departmentDetails",
    //     },
    //   },
    //   { $unwind: "$departmentDetails" },

    //   {
    //     $project: {
    //       userId: 1,
    //       patientName: 1,
    //       patientemail: 1,
    //       appointmentDate: 1,
    //       appointmentStatus: 1,
    //       isDeleted: 1,
    //       mode: 1,
    //       doctorName: "$doctorDetails.name",
    //       doctorEmail: "$doctorDetails.email",
    //       department: "$departmentDetails.name",
    //     },
    //   },
    // ]);

    return res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/totalAppointments", async (req, res) => {
  try {
    const totalAppointments = await Appointment.find({});

    res.status(200).json({
      totalAppointments,
    });
  } catch (err) {
    console.error("Error fetching total appointments:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Example route handler
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    console.log("req.user in profile route:", req.user);
    if (req.user) {
      // Access the user's information from req.user
      res.json({ user: req.user, message: "Profile data." });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    return res.status(500).json({ error: err.message });
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
          appointmentStatus: "cancelled",
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
    return res.status(200).json({
      message: "Appointment deleted successfully",
      data: deleteAppointment,
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});



// Completed Appointments Get Routes
router.get("/completedAppointments", isLoggedIn, async (req, res) => {
  try{
    const userId = req.user._id;
    console.log("This is userId when get completed appointments is hit", userId);

    const completedAppointments = await Appointment.find({
      userId,
      report: {$ne:null },
      isDeleted: false,
      mode: {$ne: "offline"} // Exclude offline appointments}
    })
      // .populate("doctorId", "name email uniqueId")
      // .populate("departmentId", "name")
      // .lean();

      if (completedAppointments.length === 0) {
        return res.status(200).json({ completedAppointments: [] });
      }
      

    return res.status(200).json({ completedAppointments });

  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

router.get('/ChatUserID',isLoggedIn,async (req, res) => {
  
  console.log("Hit ho raha hai")
  try{
    const appointments = await Appointment.find({ userId: req.user._id })
  .populate("doctorId", "name")
  .populate("departmentId", "name")
  .lean();

    if (!appointments) {
      return res.status(404).json({ message: "User not found" });
    }
  
    res.status(200).json({appointments,
      role: "user",
    });

  }catch(err){
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: err.message });

  }

})


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