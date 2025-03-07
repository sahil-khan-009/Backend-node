const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }]
}, { timestamps: true });

const Department = mongoose.model("Department", DepartmentSchema);
module.exports = Department;
