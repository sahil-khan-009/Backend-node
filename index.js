require("dotenv").config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require('cors');

const appointmentRoutes = require("./routes/AppointmentRoutes");
const adminRoutes = require('./routes/AdminRoutes');
const registerRoute = require('./routes/RegistrationRoutes');
const Doctors = require('./routes/DoctorRoutes')
const bodyParser = require("body-parser");
const port = process.env.PORT || 4000;


// const flash = require("connect-flash");


app.use(
  cors({
    origin:true, // Specify allowed origins
    credentials: true, // Required for cookies, sessions, or authentication
    // methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);



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
    console.log('Server Running On Port 4000');
})
