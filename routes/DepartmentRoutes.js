const express = require("express");
const router = express.Router();

const Department = require("../models/DepartmentSchema");

router.post("/Createdepartment", async (req, res) => {
  console.log("Received request body:", req.body);

  const { name } = req.body;

  // Check if the name is provided
  if (!name) {
    return res.status(400).json({ message: "Department name is required" });
  }

  try {
    // Check if department already exists
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return res.status(400).json({ message: "Department already exists" });
      }

    // Create and save department
    const newDepartment = new Department({ name });
    const savedDepartment = await newDepartment.save();

    res.status(201).json({
      message: "Department Created Successfully",
      department: savedDepartment,
    });
  } catch (err) {
    console.error("Error creating department:", err.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
});


//<----------------------- using this api for 2 works -------------------->
// Showing in add doctors dropdown and using department table to show all department
router.get("/Getdepartment", async (req, res) => {
  try {
    // console.log(req.body)
    const department = await Department.find({})
    .populate("doctors", "name")
    .lean();
    console.log("department==============",department)
    res.status(200).json(department); //always use 200 for GET request
  } catch (err) {
    console.log("This is catch error", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
