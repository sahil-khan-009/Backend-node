const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const appointmentRoutes = require("./routes/AppointmentRoutes");
const adminRoutes = require('./routes/AdminRoutes');
const registerRoute = require('./routes/RegistrationRoutes');
const Doctors = require('./routes/DoctorRoutes')
const bodyParser = require("body-parser");

// const flash = require("connect-flash");


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

const cors = require('cors');
app.use(
  cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true, // Allow credentials (cookies)
  })
);


// app.use(session({
//   secret: 'hello' ,// Use a strong secret in production
//   resave: false,
//   saveUninitialized: true,
// }));
// app.use(flash());

app.use("/api", appointmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", registerRoute);
app.use("/api/doctor",Doctors);





dotenv.config();


app.get('/', (req,res)=>{
    res.send('Hellow WOrlw!')
})



mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


  console.log("MONGO_URI:", process.env.MONGO_URI);

app.listen(4000, ()=>{
    console.log('Server Running On Port 4000');
})
