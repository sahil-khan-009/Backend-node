const multer = require('multer');
const path = require('path');
const crypto = require('crypto');


// diskstorage


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function(err,name){
    const fn = name.toString('hex')+path.extname(file.originalname);
    cb(null,fn)
        })

     
    }
  })
  
  const upload = multer({ storage: storage })

  module.exports = upload;


  // name.toString('hex') name is buffer so we have to convrt into
  // hexadecimal






  
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/images/uploads')
//   },  this part is setting up path for files






//   filename: function (req, file, cb) {
//     crypto.randomBytes(12, function(err,name){
// const fn = name.toString('hex')+path.extname(file.originalname);
// cb(null,fn)
//     })

//  this part is setting up file name
// }
// })