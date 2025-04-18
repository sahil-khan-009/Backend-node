const jwt = require("jsonwebtoken");

const generateUserToken = (user) => {
  return jwt.sign({ userEmail: user.userEmail, id: user._id }, process.env.JWT_KEY);
};

const generateDoctorToken = (doctor) => {
  console.log("This is doctor IN GENRATETOKEN---- token", doctor);
  return jwt.sign({ email: doctor.email, id: doctor._id }, process.env.JWT_KEY);
};

module.exports = { generateUserToken, generateDoctorToken };
