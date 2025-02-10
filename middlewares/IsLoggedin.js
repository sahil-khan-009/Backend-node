const jwt = require("jsonwebtoken");
const userModel = require("../models/Users");

module.exports = async function (req, res, next) {
  try {
    // Check for token in cookies
    if (!req.cookies.token) {
      return res.status(401).json({ message: "You need to log in first." });
    }

    // Verify the token
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
 
    // Check if the user exists in the database
    const user = await userModel.findOne({ userEmail: decoded.userEmail }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found. Please log in again." });
    }
// console.log("decoded------------",decoded)
    // Attach user to the request object
    req.user = user;

    // console.log("it is req.user in Isloggedin Middleware---==",req.user)
    next();
  } catch (err) {
    console.error("Error in isLoggedIn middleware:", err.message);
    return res.status(401).json({ message: "Authentication failed. Please log in again." });
  }
};
