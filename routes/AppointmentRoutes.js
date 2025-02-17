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
  // router.get("/appointments/:departmentId", isLoggedIn, async (req, res) => {
  //   try {
  //     const { departmentId } = req.params;
  //     console.log("Department ID:", departmentId);
  
  //     if (!mongoose.Types.ObjectId.isValid(departmentId)) {
  //       return res.status(400).json({ error: "Invalid Department ID format" });
  //     }
  
  //     const appointments = await Appointment.find({
  //       userId: req.user._id,
  //       departmentId: new mongoose.Types.ObjectId(departmentId),
  //     })
  //       .populate("userId", "userName userEmail role")
  //       .populate("departmentId", "department doctors._id doctors.name doctors.email doctors.phone doctors.availability");
  
  //     res.status(200).json(appointments);
  //   } catch (err) {
  //     console.error("Error fetching appointments:", err.message);
  //     res.status(500).json({ error: err.message });
  //   }
  // });


  router.get("/appointments", async (req, res) => {
    try {
      const appointments = await Appointment.aggregate([
        // Step 1: Lookup Doctor details (including department)
        {
          $lookup: {
            from: "doctors",
            localField: "doctorId",
            foreignField: "_id",
            as: "doctorDetails"
          }
        },
        { $unwind: "$doctorDetails" },
  
        // Step 2: Lookup Department details
        {
          $lookup: {
            from: "doctors",
            localField: "departmentId",
            foreignField: "_id",
            as: "deptDetails"
          }
        },
        { $unwind: "$deptDetails" },
  
        // Step 3: Lookup User details
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails"
          }
        },
        { $unwind: "$userDetails" },
  
        // Step 4: Group by Department (To Show All Appointments per Department)
        {
          $group: {
            _id: "$departmentId",
            departmentName: { $first: "$deptDetails.department" },
            appointments: {
              $push: {
                appointmentId: "$_id",
                appointmentDate: "$appointmentDate",
                description: "$description",
                appointmentStatus: "$appointmentStatus",
                doctor: {
                  name: "$doctorDetails.name",
                  email: "$doctorDetails.email",
                  phone: "$doctorDetails.phone",
                  availability: "$doctorDetails.availability"
                },
                patient: {
                  name: "$patientName",
                  email: "$patientEmail"
                },
                user: {
                  name: "$userDetails.userName",
                  email: "$userDetails.userEmail",
                  role: "$userDetails.role"
                }
              }
            }
          }
        },
  
        // Step 5: Restructure Response
        {
          $project: {
            _id: 0,
            department: "$departmentName",
            appointments: 1
          }
        }
      ]);

      console.log("--------appointments---------",appointments);
  
      if (appointments.length === 0) {
        return res.status(404).json({ message: "No appointments found" });
        console.log("--------appointments---------",appointments);
      }
  
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
      res.status(500).json({ error: err.message });
    }
  });




  // router.get("/appointments", async (req, res) => {
  //   try {
  //     // Hardcoded departmentId and doctorId for testing
  //     const departmentId = new mongoose.Types.ObjectId("67a21c67bc81bdef7eb84e68"); // Replace with actual departmentId
  //     const doctorId = new mongoose.Types.ObjectId("67a21c67bc81bdef7eb84e69"); // Replace with actual doctorId
  
  //     const appointments = await Appointment.aggregate([
  //       // Step 1: Match appointments with hardcoded departmentId and doctorId
  //       {
  //         $match: {
  //           departmentId: departmentId,
  //           doctorId: doctorId
  //         }
  //       },
  //       // Step 2: Lookup department details (including nested doctors array)
  //       {
  //         $lookup: {
  //           from: "doctors",
  //           localField: "departmentId",
  //           foreignField: "_id",
  //           as: "deptDetails"
  //         }
  //       },
  //       // Step 3: Unwind deptDetails array
  //       {
  //         $unwind: "$deptDetails"
  //       },
  //       // Step 4: Filter doctors array to get only the matching doctorId
  //       {
  //         $addFields: {
  //           doctorDetail: {
  //             $arrayElemAt: [
  //               {
  //                 $filter: {
  //                   input: "$deptDetails.doctors",
  //                   as: "doc",
  //                   cond: { $eq: ["$$doc._id", doctorId] }
  //                 }
  //               },
  //               0
  //             ]
  //           }
  //         }
  //       },
  //       // Step 5: Lookup user details
  //       {
  //         $lookup: {
  //           from: "users",
  //           localField: "userId",
  //           foreignField: "_id",
  //           as: "userDetails"
  //         }
  //       },
  //       // Step 6: Project required fields
  //       {
  //         $project: {
  //           _id: 1,
  //           patientName: 1,
  //           patientemail: 1,
  //           appointmentDate: 1,
  //           description: 1,
  //           appointmentStatus: 1,
  //           department: "$deptDetails.department",
  //           doctorDetail: {
  //             name: 1,
  //             email: 1,
  //             phone: 1,
  //             availability: 1
  //           },
  //           userDetails: { userName: 1, userEmail: 1, role: 1 }
  //         }
  //       }
  //     ]);
  
  //     if (appointments.length === 0) {
  //       return res.status(404).json({ message: "No appointments found for the given department and doctor" });
  //     }
  
  //     res.status(200).json(appointments);
  //   } catch (err) {
  //     console.error("Error fetching appointments:", err.message);
  //     res.status(500).json({ error: err.message });
  //   }
  // });
  // clg = console.log;  
   
   


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
