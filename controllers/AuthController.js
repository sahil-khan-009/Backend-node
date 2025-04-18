const bcrypt = require("bcrypt");
const userModel = require("../models/Users");
const { generateUserToken, generateDoctorToken} = require("../utils/genratetoken");
const Doctor = require("../models/DoctorSchema");

module.exports.registerUser = async function (req, res) {
  try {
    const { userName, userEmail, userPassword } = req.body;

    // Ensure all required fields are provided
    if (!userName || !userEmail || !userPassword) {
      return res.status(400).send("All fields are required.");
    }

    let user = await userModel.findOne({ userEmail });
    if (user) {
      return res.status(401).send("You already have an account. Please login.");
    }

    // Generate salt and hash the password
    const salt = await bcrypt.genSalt(10); // Proper salt generation
    const hashedPassword = await bcrypt.hash(userPassword, salt); // Hash password

    const newUser = await userModel.create({
      userName,
      userEmail,
      userPassword: hashedPassword, // Store hashed password
    });

    console.log("User created: ", newUser);

    // Generate and send token
    const token = generateUserToken(newUser);
    res.cookie("token", token); // Set token as cookie
    res.status(201).send("User created successfully");
  } catch (err) {
    console.error("Registration error: ", err);
    res.status(500).send(err.message);
  }
};

// Login Module

module.exports.loginUser = async function (req, res) {
  let { userEmail, userPassword } = req.body;
  console.log("This is JWT key ------", process.env.JWT_KEY);

  let user = await userModel.findOne({ userEmail });

  console.log("This is user------------------------------------------- ", user);
  if (!user) return res.send("user not found");

  bcrypt.compare(userPassword, user.userPassword, function (err, result) {
    if (err) res.status(500).send(err.message);

    console.log("result================", result);
    if (result) {
      let token = generateUserToken(user);
      // res.json({  });
      // res.cookie("token", token);
      res.cookie("token", token, {
        //Cookie not working so i am using Session storage from frontend
        httpOnly: true, // i am sending cookie manually to frontend and setting up in seesssion storage
        secure: true,
        sameSite: "lax",
        domain: "",
      });

      res.json({
        message: "You can login",
        token,
        role: user.role,
        name: user.userName,
      });
    } else {
      return res.send("email or password incorrect");
    }
  });
};

// Doctor Login--------------------------------->

module.exports.loginDoctor = async (req, res) => {
  try {
    const { email, uniqueId } = req.body;
    console.log("Request body:", req.body);
    if (!email || !uniqueId) {
      return res
        .status(400)
        .json({ message: "Email and Unique ID are required." });
    }

    // Check both email and uniqueId in one query
    const doctor = await Doctor.findOne({
      email: email.toLowerCase(),
      uniqueId,
    });

    if (!doctor) {
      return res
        .status(401)
        .json({ message: "Invalid credentials. Doctor not found." });
    }

    // Generate token
    const token = generateDoctorToken(doctor);

    // Set cookie (optional depending on frontend)
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    });

    // Send response
    res.status(200).json({
      message: "Doctor login successful",
      token,
      doctor: {
        name: doctor.name,
        email: doctor.email,
        uniqueId: doctor.uniqueId,
        doctorMongoId : doctor._id
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
}; 

module.exports.ForgetPassword = async function (req, res) {
  try {
    let { userEmail } = req.body;
    console.log("This is req.body-------", req.body);

    let emailUser = userModel.findOne({ userEmail });
    if (!emailUser) {
      return res.send("User Email does not exist");
    } else {
      const resetPassword = `/resetPassword`;
      return res.status(200).json({
        message: "User found, proceed to reset password.",
        nextStep: resetPassword,
      });
    }
  } catch (err) {
    console.log("This is catch ERROR-----", err.message);
    res.status(500).json({ message: "Server internal error" });
  }
};

module.exports.ResetPassword = async function (req, res) {
  try {
    const { userEmail, password, newpassword } = req.body;
    console.log("password newpassword----------------", req.body);
    if (!userEmail || !password || !newpassword) {
      return res.status(400).send("All fields are required.");
    }

    if (password !== newpassword) {
      return res.status(400).send("Confirm password does not match.");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newpassword, salt);

    let UpdatePssword = await userModel.findOneAndUpdate(
      { userEmail }, // Find user by email
      { userPassword: hashedPassword }, // Update the password field
      { new: true }
    );

    if (!UpdatePssword) {
      return res
        .status(404)
        .json({ message: "User not found. or Invalid email" });
    }

    res.status(200).json({
      message: "Password updated successfully.",
      user: {
        id: UpdatePssword._id,
        email: userEmail,
      },
    });
  } catch (err) {
    console.log("This is catch error-----", err.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// function authorize(role) {
//   return (req, res, next) => {
//     if (req.user.role !== role) {
//       return res.status(403).send("Access Denied");
//     }
//     next();
//   };
// }
//Logout Route
// Logout Route
module.exports.logout = function (req, res) {
  res.clearCookie("token"); // Clear the cookie named "token"
  res.status(200).send("Logged out successfully");
};
