const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Go one level up from middlewares → reach root → then uploads/reports
const uploadPath = path.join(__dirname, '..', 'uploads', 'reports');

// If folder doesn't exist, create it
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });
module.exports = upload;
