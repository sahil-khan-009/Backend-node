const express = require("express");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/DoctorSchema");
const router = express.Router();
const isLoggedIn = require("../middlewares/IsLoggedin");
const mongoose = require("mongoose");

router.post("/appointments", isLoggedIn, async (req, res) => {
  try {
    console.log("req.body================", req.body);
    const doctorId = req.body.doctorId;
    console.log("doctorId----------", doctorId);

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

router.get("/appointments", async (req, res) => {
  try {
    const appointments = await Appointment.aggregate([
      // Lookup for department details
      {
        $lookup: {
          from: "doctors",
          localField: "departmentId",
          foreignField: "_id",
          as: "departmentDetails",
        },
      },
      {
        $unwind: {
          path: "$departmentDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Lookup for doctor details inside the array
      {
        $lookup: {
          from: "doctors",
          let: { doctorId: "$doctorId" }, // Passing doctorId
          pipeline: [
            { $unwind: "$doctors" }, // Unwind the doctors array
            { $match: { $expr: { $eq: ["$doctors._id", "$$doctorId"] } } }, // Match doctor inside the array
            {
              $project: {
                // Select only necessary fields
                name: "$doctors.name",
                email: "$doctors.email",
                phone: "$doctors.phone",
                availability: "$doctors.availability",
              },
            },
          ],
          as: "doctorDetails",
        },
      },
      {
        $unwind: { path: "$doctorDetails", preserveNullAndEmptyArrays: true },
      },

      // Final projection
      {
        $project: {
          _id: 1,
          patientName: 1,
          patientemail: 1,
          appointmentDate: 1,
          description: 1,
          appointmentStatus: 1,
          department: "$departmentDetails.department",
          doctor: "$doctorDetails",
        },
      },
    ]);

    res.status(200).json(appointments);
  } catch (err) {
    console.error("Error fetching appointments:", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.put("/updateAppointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("It is Post Id=====", id);
    let {
      patientName,
      doctorName,
      appointmentDate,
      description,
      patientemail,
    } = req.body;

    let update = await Appointment.findByIdAndUpdate(
      id,
      {
        patientName,
        doctorName,
        appointmentDate,
        description,
        patientemail,
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

router.delete("/deleteAppointment/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("ID received in delete route:", id);
    console.log("req.user._id----------------------", req.user);

    // Check if appointment exists and mark it as deleted
    const deleteAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: req.user ? req.user._id : null, // Ensure req.user exists
        }
      },
      { new: true } // Returns the updated document
    );

    if (!deleteAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    console.log("Appointment deleted successfully:", deleteAppointment);
    return res.status(200).json({ message: "Appointment deleted successfully", data: deleteAppointment });

  } catch (error) {
    console.error("Error deleting appointment:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


module.exports = router;
