const bcrypt = require("bcrypt");
const userModel = require("../models/Users");
const { genratetoken } = require('../utils/genratetoken');

module.exports.registerUser = async function (req, res) {
  try {
    const { userName, userEmail, userPassword } = req.body;

    // Ensure all required fields are provided
    if (!userName || !userEmail || !userPassword) {
      return res.status(400).send("All fields are required.");
    }

    let user = await userModel.findOne({ userEmail });
    if (user) {
      return res
        .status(401)
        .send("You already have an account. Please login.");
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
    const token = genratetoken(newUser);
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
  
    let user = await userModel.findOne({ userEmail});
    if (!user) return res.send("user not found");
  
    bcrypt.compare(userPassword, user.userPassword, function (err, result) {

        if(err) res.status(500).send(err.message);

        console.log('result================',result);
      if (result) {
        let token = genratetoken(user);
        res.cookie("token", token);
        res.send("You can login");
      } else {
        return res.send("email or password incorrect");
      }
    });
};
  

module.exports.ForgetPassword = async function(req,res){
 try{
   let { userEmail } = req.body;
   console.log("This is req.body-------",req.body)

   let emailUser = userModel.findOne({userEmail});
    if(!emailUser){
      return res.send("User Email does not exist")
    } else{
           const resetPassword = `/resetPassword`;
           return res.status(200).json({
            message: "User found, proceed to reset password.",
            nextStep: resetPassword,
          });
    }
  }catch(err){
    console.log("This is catch ERROR-----",err.message)
    res.status(500).json({message:"Server internal error"})
  }
}

module.exports.ResetPassword = async function(req,res){
 try{
   const { userEmail,password ,newpassword} = req.body;
   console.log("password newpassword----------------",req.body);
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
    { userPassword:hashedPassword}, // Update the password field
    { new: true });

    if (!UpdatePssword) {
      return res.status(404).json({ message: "User not found. or Invalid email" });
    }
  
    res.status(200).json({
      message: "Password updated successfully.",
      user: {
        id: UpdatePssword._id,
        email:userEmail,
        
      },
    });

}catch(err){ 
  console.log("This is catch error-----",err.message);
  res.status(500).json({ message: "Internal server error." });
}

}

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


