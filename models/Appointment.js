const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  patientName: {
    type: String,
  },
 
  patientemail: {
    type: String, // Email of the person associated with the appointment
    required: true,
    unique: true
  },
  appointmentDate: {
    type: Date,
  },
  description: {
    type: String,
  },

  appointmentStatus: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },

  departmentId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor", // Reference to the Doctor model
    required: true,

  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor", // Reference to the Doctor model
    required: true,
  },
  
  availability:{
    type: String,
    ref: "Doctor",
    required: true,
  },

isDeleted: {
  type: Boolean,
  default: false, // Not deleted by default
},

deletedAt: {
  type: Date, // Stores the timestamp of deletion
  default: null,
},

deletedBy: {
  type: mongoose.Schema.Types.ObjectId, // Tracks who deleted it
  ref: "User",
  default: null,
},

});


const Appointment = mongoose.model("Appointment", AppointmentSchema);

module.exports = Appointment;
