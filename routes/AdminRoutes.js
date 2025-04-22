const express = require("express");
const Appointment = require("../models/Appointment");
const Department = require("../models/DepartmentSchema");
const router = express.Router();
const AuthMiddlewares = require("../middlewares/AuthMiddleware");
const isLoggedIn = require("../middlewares/IsLoggedin");
const sendEmail = require("../utils/AppointmentMail");
const userModel = require("../models/Users");
const { v4: uuidv4 } = require('uuid');
const stripe = require("stripe")("sk_test_51R7YKDDRfbAZZF8HOLYEtXDV8NmoyvhtVYjSs3coVuCOSmKOsKERkdL0s5wWohRyhHdkN03Y54fM47Cu1hr5qeJo00s8yRHEoY");
const { createDailyRoom } = require("../utils/daily");
// Import the function to create a room

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

router.get("/totalAppointment", async (req, res) => {
  // res.json({ message: "Hellow chal raha hai" });

  try {
    const AllAppointment = await Appointment.aggregate([
      // { $sort: { appointmentDate: 1 } },
      // { $match: { isDeleted: false } },

      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
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
          mode :1,
          registerUser: "$userDetails.userEmail", // ✅ Corrected projection
          doctorName: "$doctorDetails.name",
          doctorEmail: "$doctorDetails.email",
          doctorStartTime: "$doctorDetails.timings.start",
          doctorEndTime: "$doctorDetails.timings.end",
          department: "$departmentDetails.name",
        },
      },
    ]);
    return res.status(200).json(AllAppointment);
  } catch (err) {
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



router.patch("/appointments/:id/:status/:mode", async (req, res) => {
  try {
    const { id, status, mode } = req.params;
    const { timeSlot } = req.body;

    if (!timeSlot) {
      return res.status(400).json({ message: "Time slot is required." });
    }

    if (status !== "confirm" && status !== "cancel") {
      return res
        .status(400)
        .json({ error: "Please select value only 'confirm' or 'cancel'" });
    }

    let videoCallLink = null;

    if (mode === "online" && status === "confirm") {
      videoCallLink = await createDailyRoom();
    }

    const updateFields = {
      appointmentStatus: status === "confirm" ? "confirmed" : "cancelled",
      mode,
    };

    if (videoCallLink) {
      updateFields.videoCallLink = videoCallLink;
    }

    const updateStatus = await Appointment.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    ).populate("doctorId", "name");

    if (!updateStatus) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    const doctorName = updateStatus.doctorId
      ? updateStatus.doctorId.name
      : "Unknown Doctor";

    const email = updateStatus.patientemail;
    const message = `Dear ${updateStatus.patientName}, your appointment with Dr. ${doctorName} on ${new Date(
      updateStatus.appointmentDate
    ).toDateString()} at time slot: ${timeSlot} has been ${
      updateStatus.appointmentStatus
    }.${
      videoCallLink
        ? `\nJoin via video: ${videoCallLink} (Also available in your dashboard)`
        : " (Please check your dashboard for appointment details)"
    }`;

    await sendEmail(email, "Appointment Status Updated", message);

    res.status(200).json({
      updateStatus,
      message:
        updateStatus.appointmentStatus === "confirmed"
          ? "Appointment Approved"
          : "Appointment Canceled",
    });
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});




// router.patch("/appointments/:id/:status/:mode", async (req, res) => {
//   try {
//     const { id, status, mode } = req.params;
//     const { timeSlot } = req.body;
     
// // Example (Node.js + Express):
// if (!req.body.timeSlot) {
//   return res.status(400).json({ message: "Time slot is required." });
// }

//     // Validate status
//     if (status !== "confirm" && status !== "cancel") {
//       return res
//         .status(400)
//         .json({ error: "Please select value only 'confirm' or 'cancel'" });
//     }

//     // Generate Jitsi link if mode is online and status is confirmed
//     let videoCallLink = null;
//     if (mode === "online" && status === "confirm") {
//       const roomName = uuidv4();
//       videoCallLink = `https://meet.jit.si/${roomName}`;
//     }

//     // Update appointment
//     const updateFields = {
//       appointmentStatus: status === "confirm" ? "confirmed" : "cancelled",
//       mode,
//     };

//     if (videoCallLink) {
//       updateFields.videoCallLink = videoCallLink;
//     }

//     const updateStatus = await Appointment.findByIdAndUpdate(
//       id,
//       updateFields,
//       { new: true }
//     ).populate("doctorId", "name");

//     if (!updateStatus) {
//       return res.status(404).json({ error: "Appointment not found" });
//     }

//     // Get doctor name
//     const doctorName = updateStatus.doctorId
//       ? updateStatus.doctorId.name
//       : "Unknown Doctor";

//     // Prepare and send email
//     const email = updateStatus.patientemail;
//     const message = `Dear ${
//       updateStatus.patientName
//     }, your appointment with Dr. ${doctorName} on ${new Date(
//       updateStatus.appointmentDate
      
//     ).toDateString()} has this is time slot --- ${timeSlot} ----- been ${updateStatus.appointmentStatus}.${
//       videoCallLink ? `\n ( Please Check your appointment dashboard for appintment timing )  Or Join via video: ${videoCallLink}` : "Mode is offline ( Please Check your appointment dashboard) "
//     }`;

//     await sendEmail(email, "Appointment Status Updated", message);

//     res.status(200).json({
//       updateStatus,
//       message:
//         updateStatus.appointmentStatus === "confirmed"
//           ? "Appointment Approved"
//           : "Appointment Canceled",
//     });
//   } catch (err) {
//     console.error("Error is ", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });








// router.patch("/appointments/:id/:status/:mode", async (req, res) => {
//   try {
//     const { id, status,mode } = req.params;
//     // const {patientemail} = req.body;

// if(mode === "online"){
//   const RoomName = uuidv4();
//   const updateStatus = await Appointment.findByIdAndUpdate({
//     id,
//     appointmentStatus: status === "confirm" ? "confirmed" : "cancelled",
//     videoCallLink:
//   })


// }

//     // Validate the status
//     if (status !== "confirm" && status !== "cancel") {
//       return res
//         .status(400)
//         .json({ error: "Please select value only 'confirm' or 'cancel'" });
//     }

// // const appointment = Appointment.findById({id,

// // })

//     // Update the appointment status
//     const updateStatus = await Appointment.findByIdAndUpdate(
//       id,
//       { appointmentStatus: status === "confirm" ? "confirmed" : "cancelled" },
//       { new: true }
//     ).populate("doctorId", "name");
//     console.log("updateStatus======", updateStatus);
//     if (!updateStatus) {
//       return res.status(404).json({ error: "Appointment not found" });
//     }
//     const doctorName = updateStatus.doctorId
//       ? updateStatus.doctorId.name
//       : "Unknown Doctor";

//     // Send notification email
//     const email = `aestheticaesthetic236@gmail.com`; //updateStatus.patientemail; // Assuming you store the patient's email in the appointment schema
//     // console.log("email----",email)
//     const message = `Dear ${
//       updateStatus.patientName
//     }, your appointment with Dr. ${doctorName} on ${new Date(
//       updateStatus.appointmentDate
//     ).toDateString()} has been ${updateStatus.appointmentStatus}.`;

//     await sendEmail(email, "Appointment Status Updated", message);

//     res.status(200).json({
//       updateStatus,
//       message:
//         updateStatus.appointmentStatus === "confirmed"
//           ? "Appointment Approved"
//           : "Appointment Canceled",
//     });
//   } catch (err) {
//     console.error("Error is ", err.message);
//     res.status(500).json({ error: err.message });
//   }
// });


// <-----------------All Get api Department----------------->

router.get("/getDepartment", async (req, res) => {
try{
  const allDepartment = await Department.find().populate("doctors" );
  console.log("allDepartment", allDepartment);
  res.status(200).json(allDepartment);

}catch(err){
  console.log("This is catch error-----", err.message);
  res.status(500).json({ message: "Server internal error",
 error: err.message,
   });

}
});




router.post("/create-payment-intent", async (req, res) => {
  try {
      const { amount, currency } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
          amount, // Amount in cents (e.g., 5000 = $50.00)
          currency,
          payment_method_types: ["card"], // Supports cards
      });

      res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



module.exports = router;




















// router.post("/payment", async (req, res) => {
//   try {
//     const { departmentPay, paymentMethodId } = req.body;

//     if (!paymentMethodId || !departmentPay?.price) {
//       return res.status(400).json({ error: "Invalid payment details" });
//     }

//     const price = Number(departmentPay.price);
//     if (isNaN(price) || price <= 0) {
//       return res.status(400).json({ error: "Invalid price value" });
//     }

//     console.log("Processing payment for:", departmentPay.name);
//     console.log("Price in cents:", price * 100);

//     const idempotencyKey = uuidv4();

//     // Create a Payment Intent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: price * 100, // Convert to cents
//       currency: "usd",
//       payment_method: paymentMethodId,
//       confirm: true,
//     });

//     res.status(200).json({
//       success: true,
//       paymentIntent,
//     });
//   } catch (err) {
//     console.error("Payment Error:", err);
//     res.status(500).json({
//       error: "Payment failed",
//       details: err.message,
//     });
//   }
// });
