const mongoose = require("mongoose");

const DoctorSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    trim: true,
  },
  doctors: [
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
      },
      phone: {
        type: String,
        // required: true,
        trim: true,
      },
      availability: {
        type: [String],
        default: [],
        validate: {
          validator: function (days) {
            const validDays = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ];
            return days.every((day) => validDays.includes(day));
          },
          message: "Invalid weekday in availability",
        },
      },
    },
  ],
}, { timestamps: true });

const Doctor = mongoose.model("Doctor", DoctorSchema);

module.exports = Doctor;