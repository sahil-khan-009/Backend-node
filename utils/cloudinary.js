const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: "dzaglepvu",
  api_key: "842826272515899",
  api_secret: "bQ2xRKYu2oki3e6YPK1HkW101cE",
});

module.exports = cloudinary;
