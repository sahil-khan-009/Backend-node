const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userPassword: {
  type : String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Predefined roles
    default: 'user', // Default role for newly registered users
  },

  
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;