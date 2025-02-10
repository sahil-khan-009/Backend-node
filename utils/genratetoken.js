const jwt = require('jsonwebtoken');

const genratetoken = (user) => {
  return jwt.sign({ userEmail: user.userEmail, id: user._id }, process.env.JWT_KEY); // Use JWT_KEY
};

module.exports.genratetoken = genratetoken;
