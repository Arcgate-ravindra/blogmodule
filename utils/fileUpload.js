const multer = require('multer');



// Set storage engine and file filter
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if(req.query.type === "user"){
            cb(null, 'images/users/'); // Specify the destination directory for uploaded files
        }else{
            cb(null, 'images/blogs/');
        }

    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`
      cb(null, uniqueName); // Use the uniqueName file name as the saved file name
    }
  });


const upload = multer({ storage: storage });


module.exports = upload;