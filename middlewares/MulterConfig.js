// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Go one level up from middlewares → reach root → then uploads/reports
// const uploadPath = path.join(__dirname, '..', 'uploads', 'reports');


// console.log("Upload Path------------------:", uploadPath);
// // If folder doesn't exist, create it
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
//   console.log("Created the uploads/reports folder!");
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath);
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage });
// module.exports = upload;


const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require("../utils/cloudinary") // Adjust the path accordingly

// Cloudinary Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reports', // Folder name in your Cloudinary dashboard
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'], // Allowed file types
    transformation: [{ width: 500, height: 500, crop: 'limit' }], // optional
  },
});

const upload = multer({ storage });

module.exports = upload;
