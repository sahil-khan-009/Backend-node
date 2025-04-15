const jwt = require("jsonwebtoken");
const userModel = require("../models/Users");

// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//     const authHeader = req.headers.authorization;
    
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ message: "You need to log in first." });
//     }

//     const token = authHeader.split(" ")[1]; // Extract token after 'Bearer '

//     jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
//         if (err) {
//             return res.status(403).json({ message: "Invalid or expired token." });
//         }

//         req.user = decoded; // Store decoded user info in req.user
//         next(); // Proceed to the next middleware
//     });
// }





//  ye middleware use tab karna hai jab production pe kaam karna ho yaani live pe
 
module.exports = async function (req, res, next) {
  try {

    // console.log("process.env.jwtKey",process.env.JWT_KEY);
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "You need to log in first." });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.split(" ")[1]; // Extract token after 'Bearer ' qwfyuyt345654edcvnbvdsert

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    // console.log("decoded--------------------",decoded)

    // Check if the user exists in the database
    const user = await userModel.findOne({ userEmail: decoded.userEmail }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found. Please log in again." });
    }

    // Attach user to the request object
    req.user = user;
    console.log(req.user);

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("Error in isLoggedIn middleware:", err.message);
    return res.status(401).json({ message: "Authentication failed. Please log in again." });
  }
};





// ye middleware use tab karna hai jab local pe kaam karna ho 

// module.exports = async function (req, res, next) {
//   try {
//     // Check for token in cookies
//     if (!req.cookies.token) {
//       return res.status(401).json({ message: "You need to log in first." });
//     }

//     // Verify the token
//     const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
 
//     // Check if the user exists in the database
//     const user = await userModel.findOne({ userEmail: decoded.userEmail }).select("-password");
//     if (!user) {
//       return res.status(404).json({ message: "User not found. Please log in again." });
//     }
// // console.log("decoded------------",decoded)
//     // Attach user to the request object
//     req.user = user;

//     // console.log("it is req.user in Isloggedin Middleware---==",req.user)
//     next();
//   } catch (err) {
//     console.error("Error in isLoggedIn middleware:", err.message);
//     return res.status(401).json({ message: "Authentication failed. Please log in again." });
//   }
// };
