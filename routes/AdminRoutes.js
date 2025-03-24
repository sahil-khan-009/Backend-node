const express = require("express");
const Appointment = require("../models/Appointment");
const router = express.Router();
const AuthMiddlewares = require("../middlewares/AuthMiddleware");
const isLoggedIn = require("../middlewares/IsLoggedin");
const sendEmail = require('../utils/AppointmentMail');
const userModel = require("../models/Users");

// Admin route to fetch appointments


router.get("/appointments", isLoggedIn, AuthMiddlewares, async (req, res) => {
  try {
    const { patientName, doctorName, startDate, endDate, status, page, limit } =
      req.query;

    const filter = {};
    if (patientName)
      filter.patientName = { $regex: patientName, $options: "i" };
    if (doctorName) filter.doctorName = { $regex: doctorName, $options: "i" };
    if (startDate && endDate)
      filter.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    if (status) filter.status = status;

    const perPage = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;

    const totalCount = await Appointment.countDocuments(filter); //counts the number of document

    const appointments = await Appointment.find(filter)
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      currentPage,
      totalPages: Math.ceil(totalCount / perPage),
      totalCount,
      appointments,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// ALL REGISTERED USER ND APPOINTMNTS STATUS


router.get("/totalAppointment", async  (req,res)=>{
  // res.json({ message: "Hellow chal raha hai" }); 

  try{
  const AllAppointment  = await  Appointment.aggregate([
    { $sort: { appointmentDate: 1 } },
    { $match: { isDeleted: false } },
   
   {
    $lookup:{
      from : "users",
      localField: "userId",
      foreignField:"_id",
      as : "userDetails",
    },
   },
   { $unwind: "$userDetails" },
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
        mainUser : " $userDetails.userName",
        doctorName: "$doctorDetails.name", // ✅ Fetching doctor's name
        doctorEmail: "$doctorDetails.email", // ✅ Fetching doctor's email
        department: "$departmentDetails.name", // ✅ Fetching department name
         
      },
    },
  ])
  return res.status(200).json(AllAppointment);

  }catch(err){
    console.log("this is catch error", err.message);
    return res.status(500).json({
      Error: "Internal server error",
      err: err.message,
    });
  

  }
 
});

// Update Appointment
router.put("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      patientName,
      doctorName,
      appointmentDate,
      description,
      appointmentStatus,
    } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id.trim(),
      {
        patientName,
        doctorName,
        appointmentDate,
        description,
        appointmentStatus,
      },
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json(updatedAppointment);
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// Delete Appointment
router.delete("/appointments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAppointment = await Appointment.findByIdAndDelete(id.trim());

    if (!deletedAppointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete appointment" });
  }
});

//updating status of pending requests


router.patch("/appointments/:id/:status", async (req, res) => {
  try {
    const { id, status } = req.params;
    // const {patientemail} = req.body;

    // Validate the status
    if (status !== "confirm" && status !== "cancel") {
      return res
        .status(400)
        .json({ error: "Please select value only 'confirm' or 'cancel'" });
    }

    // Update the appointment status
    const updateStatus = await Appointment.findByIdAndUpdate(
      id,
      { appointmentStatus: status === "confirm" ? "confirmed" : "cancelled" },
      { new: true }
    );
// console.log("updateStatus======",updateStatus)
    if (!updateStatus) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Send notification email
    const email = updateStatus.patientemail; // Assuming you store the patient's email in the appointment schema
    const message = `Dear ${updateStatus.patientName}, your appointment with Dr. ${updateStatus.doctorName} on ${new Date(
      updateStatus.appointmentDate 
    ).toDateString()} has been ${updateStatus.appointmentStatus}.`;

    await sendEmail(email, "Appointment Status Updated", message);

    res.status(200).json(updateStatus);
  } catch (err) {
    console.error("Error is ", err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
