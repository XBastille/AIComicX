const express = require("express");
const multer = require("multer");
const path = require("path");
const spawn = require('child_process').spawn;


const router = express.Router();

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Nothis is uploaded buddy"
        });
    }

    const filePath = req.file.path;


    const pythonProcess = spawn("python3", ["../genai_models/nar2nar.py", filePath]);

    let response = "";
    pythonProcess.stdout.on("data", (data) => {
        response += data.toString();
    });

    pythonProcess.stderr.on("data", (error) => {
        console.error(error);
    });

    pythonProcess.on("close", (code) => {
        res.json({
            success: true,
            message: 'response sent bro',
            result: response.trim()
        });
    });
});
