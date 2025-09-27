const multer = require('multer');
const path = require('path')

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, "userFile" + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

module.exports = upload