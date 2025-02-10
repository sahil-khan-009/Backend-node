const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: "khanshil504@gmail.com",
    pass: "vkhs yuqg gokd toyb", // App password
  },
});


const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: "khanshil504@gmail.com",
      to,
      subject,
      text,
    };
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (err) {
    console.error("Error sending email:", err.message);
    throw new Error("Failed to send email");
  }
};


module.exports = sendEmail;
