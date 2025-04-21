const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    // unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true, 
  },
  uniqueId:{
    type:String,
    required: true
  },
  availability: {
    type: [String],
    default: [],
    validate: {
      validator: function (days) {
        const validDays = [
          "Monday", "Tuesday", "Wednesday", "Thursday", 
          "Friday", "Saturday", "Sunday"
        ];
        return days.every((day) => validDays.includes(day));
      },
      message: "Invalid weekday in availability",
    },
  },

  timings: {
    start: { type: String, required: true }, // Common start time
    end: { type: String, required: true },   // Common end time
  },

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  }
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", DoctorSchema);
module.exports = Doctor;
