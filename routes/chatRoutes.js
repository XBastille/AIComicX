const express = require("express");
const multer = require("multer");
const path = require("path");
const spawn = require('child_process').spawn;
const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');


const router = express.Router();

const pythonConnect = (res, python, scriptPath) => {

    return new Promise(async (resolve, reject) => {
        // const filePath = path.join(__dirname, "../uploads/test.pdf");

        //   const outputFilePath = path.join(__dirname, "../response/output.pdf");
        const pythonProcess = spawn('python', [scriptPath, python]);
        console.log("hii");
        console.log("scriptPath", scriptPath);
        console.log("python", python);
        // console.log("pythonProcess", pythonProcess);

        let response;
        pythonProcess.stdout.on("data", async (data) => {
            response = data.toString();
            console.log(response);
            console.log(data);
            try {
                // const response = await pdf(data);
                // console.log(response.text);
            } catch (err) {
                // console.error('Failed to parse PDF:', err);
            }
        });

        pythonProcess.stderr.on("data", (error) => {
            const errorMessage = error.toString();
            console.error('Python Error:', errorMessage);

        });


        pythonProcess.on("close", (code) => {

            if (code === 0) {
                const responsePath = path.join(__dirname, "../response/first");
                fs.writeFileSync(responsePath, response);
                console.log(response);
                console.log('Python script executed successfully');
                const result = {
                    success: true,
                    message: 'Python processing completed',
                    resultMsg: response
                };
                const resultToReact = path.join(__dirname, "../pythonInput/first_comic.md");

                // res.json(resultToReact);
                resolve(response);
            }
            else {

                reject(new Error(`Python file has given some error: ${code}`));

            }
        });
    })
}

const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, "userFile" + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

// upload.single("file"),
router.post("/transferNar2nar", upload.single("file"), async (req, res) => {
    const error = []
    if (!req.file) {
        error.push({ msg: "Nothing has been uploaded" })
    }

    const pythonnar2nar = path.join(__dirname, "../pythonInput/nar2nar");
    const filePath = req.file.path;
    // const filePath = path.join(__dirname, `../uploads/userFile.txt`);
    const ext = path.extname(req.file.originalname).toLowerCase();
    // const ext = '.txt';

    try {
        if (ext === '.pdf') {
            console.log("hello")
            let dataBuffer = fs.readFileSync(filePath);
            pdf(dataBuffer).then(function (data) {
                try {
                    fs.writeFileSync(pythonnar2nar, data.text);

                } catch (error) {
                    console.log('Error in writing the file', error);
                }

            });
        }

        else if (ext === '.txt') {
            console.log("inside txt");
            const data = fs.readFileSync(filePath, "utf-8");
            fs.writeFileSync(pythonnar2nar, data);
        }

        else if (ext === '.docx') {
            const { value: text } = await mammoth.extractRawText({ path: filePath });
            console.log("text wala line run ho gaya h");
            fs.writeFileSync(pythonnar2nar, text);
        }

        else {
            error.push({ msg: "Unsupported file type" });
            return res.json({ success: false, msg: "Only PDF , TXT and DOCX files allowed", error });
        }

    } catch (error) {
        console.log(error);
    }

    if (error.length > 0) {
        return res.json({ sucess: false, msg: "re render the choose page", error })
    }


    const scriptPath = path.join(__dirname, '../genai_models/nar2nar.py');

    try {
        console.log("pythonConect se pahle");
        console.log("pythonnar2nar", pythonnar2nar);
        console.log("scriptPath", scriptPath);
        const response = await pythonConnect(res, pythonnar2nar, scriptPath);
        console.log("pythonConnect ke baad");
        console.log("Response of the python script is ", response);
        if (response) {
            console.log("Response k andar aa gaya");
            return res.json({ sucess: true, msg: "Data is ready", result: response });
        }

    } catch (err) {
        console.error("Python execution failed:", err);
    }


});
// upload.single("file"),

router.post("/transferSt2nar", upload.single("file"), async (req, res) => {
    const error = []
    if (!req.file) {
        error.push({ msg: "Nothing has been uploaded" })
    }

    const pythonst2nar = path.join(__dirname, "../pythonInput/st2nar.txt");
    const filePath = req.file.path;
    // const filePath = path.join(__dirname, `../uploads/userFile.txt`);

    const ext = path.extname(req.file.originalname).toLowerCase();
    // const ext = '.txt';

    try {
        if (ext === '.pdf') {
            console.log("hello")
            let dataBuffer = fs.readFileSync(filePath);
            pdf(dataBuffer).then(function (data) {
                try {
                    fs.writeFileSync(pythonst2nar, data.text);

                } catch (error) {
                    console.log('Error in writing the file', error);
                }

            });
        }

        else if (ext === '.txt') {
            console.log("inside txt");
            const data = fs.readFileSync(filePath, "utf-8");
            fs.writeFileSync(pythonst2nar, data);
        }

        else if (ext === '.docx') {
            const { value: text } = await mammoth.extractRawText({ path: filePath });
            console.log("text wala line run ho gaya h");
            fs.writeFileSync(pythonst2nar, text);
        }

        else {
            error.push({ msg: "Unsupported file type" });
            return res.json({ success: false, msg: "Only PDF , TXT and DOCX files allowed", error });
        }

    } catch (error) {
        console.log(error);
    }

    if (error.length > 0) {
        return res.json({ sucess: false, msg: "re render the choose page", error })
    }
    const scriptPath = path.join(__dirname, '../genai_models/st2nar.py');

    try {
        console.log("pythonConect se pahle");
        console.log("pythonst2nar", pythonst2nar);
        console.log("scriptPath", scriptPath);
        const response = await pythonConnect(res, pythonst2nar, scriptPath);
        console.log("pythonConnect ke baad");
        console.log("Response of the python script is ", response);
        if (response) {
            console.log("Response k andar aa gaya");
            return res.json({ sucess: true, msg: "Data is ready", result: response });
        }

    } catch (err) {
        console.error("Python execution failed:", err);
    }
});


router.post('/transferSam', async (req, res) => {
    const { text } = req.body
    console.log(text);
    const scriptPath = path.join(__dirname, '../genai_models/sam.py');
    const pythonProcess = spawn('python', [scriptPath, text]);
    console.log("hii");

    pythonProcess.stdout.on('data', (data) => {
        console.log(data.toString());
        return res.json(data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
        console.log(data.toString());
        return res.json(data.toString());
    });

    pythonProcess.on('close', (code) => {
        console.log(`Process exited with code ${code}`);
    });
});

router.post('/ayush', async (req, res) => {
    const scriptPath = path.join(__dirname, '../genai_models/st2nar.py');
    const { text } = req.body;

    const pythonProcess = spawn('C:\\Program Files\\Python313\\python.exe', [scriptPath, text]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        console.log(`Process exited with code ${code}`);

        if (code !== 0 || errorOutput) {
            console.error(errorOutput);
            return res.status(500).json({ error: errorOutput || 'Python script error' });
        }

        res.json({ result: output });
    });
});



module.exports = router;