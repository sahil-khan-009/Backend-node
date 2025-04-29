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
// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: 'reports', 
//     resource_type: 'auto',     // ✅ Let Cloudinary decide and allow inline display
// , // ADD THIS
//     type: 'upload',       // ADD THIS
//     allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
//     // transformation only applies to images, you might skip it for PDFs
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'reports',
    resource_type: 'auto', // 🔄 This allows public delivery for PDFs
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
});


const upload = multer({ storage });

module.exports = upload;
