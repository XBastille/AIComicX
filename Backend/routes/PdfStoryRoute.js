const express = require("express");
const path = require("path");
const spawn = require('child_process').spawn;
const fs = require('fs');
const upload = require('../common/middleware/multerMiddleware')
const { extractText } = require('../common/utils/fileProcessor');

const PdfStoryRoute = express.Router();

const pythonConnect = (res, python, scriptPath) => {

    return new Promise(async (resolve, reject) => {
        const pythonProcess = spawn('python', [scriptPath, python]);
        let response;
        pythonProcess.stdout.on("data", async (data) => {
            response = data.toString();
            console.log(response);
        });

        pythonProcess.stderr.on("data", (error) => {
            const errorMessage = error.toString();
            console.error('Python Error:', errorMessage);

        });


        pythonProcess.on("close", (code) => {

            if (code === 0) {
                const responsePath = path.join(__dirname, "../response/first");
                fs.writeFileSync(responsePath, response);
                console.log('Python script executed successfully');
                const result = {
                    success: true,
                    message: 'Python processing completed',
                    resultMsg: response
                };
                const resultToReact = path.join(__dirname, "../pythonInput/first_comic.md");
                resolve(response);
            }
            else {

                reject(new Error(`Python file has given some error: ${code}`));

            }
        });
    })
}

PdfStoryRoute.post("/transferNar2nar", upload.single("file"), async (req, res) => {
    const error = []
    if (!req.file) {
        error.push({ msg: "Nothing has been uploaded" })
        return res.json({ sucess: false, msg: "re render the choose page", error })
    }

    const pythonnar2nar = path.join(__dirname, "../pythonInput/nar2nar");
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
        await extractText(pythonnar2nar, filePath, ext);
        const scriptPath = path.join(__dirname, '../genai_models/nar2nar.py');
        const response = await pythonConnect(res, pythonnar2nar, scriptPath);
        if (response) {
            return res.json({ sucess: true, msg: "Data is ready", result: response });
        }

    } catch (err) {
        console.error("Python execution failed:", err);
    }
});


PdfStoryRoute.post("/transferSt2nar", upload.single("file"), async (req, res) => {
    const error = []
    if (!req.file) {
        error.push({ msg: "Nothing has been uploaded" })
        return res.json({ sucess: false, msg: "re render the choose page", error })
    }

    const pythonst2nar = path.join(__dirname, "../pythonInput/st2nar.txt");
    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
        const scriptPath = path.join(__dirname, '../genai_models/st2nar.py');
        await extractText(pythonst2nar,filePath,ext);
        const response = await pythonConnect(res, pythonst2nar, scriptPath);
        if (response) {
            return res.json({ sucess: true, msg: "Data is ready", result: response });
        }
    } catch (err) {
        console.error("Python execution failed:", err);
    }
});

module.exports = PdfStoryRoute;