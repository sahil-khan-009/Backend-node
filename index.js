require("dotenv").config();
const express = require('express');
const app = express();
const path = require("path");

// Add a  stripe key
// const stripe = require('stripe')('sk_test_51R7YKDDRfbAZZF8HRPJitcD3BIPL8pVv8JDOsVyAJiHK4WLtORzsB3NCyIJUwae5R8fE8UIvfjuVAYY4tYd9K7IZ001uGqFgov');
// const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require('cors');

const appointmentRoutes = require("./routes/AppointmentRoutes");
const adminRoutes = require('./routes/AdminRoutes');
const registerRoute = require('./routes/RegistrationRoutes');
const Doctors = require('./routes/DoctorRoutes')
const Department = require('./routes/DepartmentRoutes')
const doctorDashboard = require('./routes/DoctorDashboard')
const bodyParser = require("body-parser");
const port = process.env.PORT || 4000;




// Serve the uploads folder publicly



// const flash = require("connect-flash");


app.use(
  cors({
    origin:true, // Specify allowed origins
    credentials: true, // Required for cookies, sessions, or authentication
    // methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// app.use((req, res, next) => {
//   if (req.method === "GET" && req.body && Object.keys(req.body).length > 0) {
//     console.log("Warning: GET request received with a body, ignoring...");
//   }
//   next();
// });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(session({
  secret: process.env.JWT_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      sameSite:  'none', // Adjust sameSite
  },
}));



// app.use(
//   cors({
//     origin: 'http://localhost:5174', // Your frontend URL
//     credentials: true, // Allow credentials (cookies)
//     httpOnly:true,
//     sameSite:'lax'
//   })
// );


// app.use(flash());

app.use("/api", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", registerRoute);
app.use("/api/doctor",Doctors);
app.use('/api/department',Department);
app.use('/api/doctorDashboard',doctorDashboard);




app.get('/', (req,res)=>{
    res.send('Hellow WORLD')
})

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env file!");
  process.exit(1);
}


mongoose
  .connect(MONGO_URI, {
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

app.listen(port, ()=>{
    console.log('Server Running On Port 4000',port);
})
