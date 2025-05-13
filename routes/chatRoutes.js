const express = require("express");
const multer = require("multer");
const path = require("path");
const spawn = require('child_process').spawn;
const fs = require('fs');
const pdf = require('pdf-parse');


const router = express.Router();

const pythonConnect = (res, python, scriptPath) => {

    return new Promise(async (resolve, reject) => {
        // const filePath = path.join(__dirname, "../uploads/test.pdf");

        //   const outputFilePath = path.join(__dirname, "../response/output.pdf");


        const pythonProcess = spawn('python', [scriptPath, python]);
        console.log("hii");

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

                res.json(resultToReact);
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
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });


router.post("/transfer", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "Nothing is uploaded buddy"
        });
    }
    const pythonnar2nar = path.join(__dirname, "../pythonInput/nar2nar");
    const filePath = req.file.path;

    let dataBuffer = fs.readFileSync(filePath);


    pdf(dataBuffer).then(function (data) {
        try {
            fs.writeFileSync(pythonnar2nar, data.text);

        } catch (error) {
            console.log('Error in writing the file', error);
        }

    });


    const scriptPath = path.join(__dirname, '../genai_models/nar2nar.py');

    try {
        await pythonConnect(res, pythonnar2nar, scriptPath);

    } catch (err) {
        console.error("Python execution failed:", err);
    }


});

router.post("/transferSt2nar", upload.single("file"), async (req, res) => {
    const error = []
    if (!req.file) {
        error.push({ msg: "Nothing has been uploaded" })
    }

    const pythonst2nar = path.join(__dirname, "../pythonInput/st2nar");
    const filePath = req.file.path;

    const ext = path.extname(req.file.originalname).toLowerCase();

    try {
        if (ext === '.pdf') {
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
            const data = fs.readFileSync(filePath, "utf-8");
            fs.writeFileSync(pythonst2nar, data);
        }
        else {
            error.push({ msg: "Unsupported file type" });
            return res.json({ success: false, msg: "Only PDF and TXT files allowed", error });
        }
    } catch (error) {
        console.log(error);
    }

    if (error.length > 0) {
        return res.json({ sucess: false, msg: "re render the choose page", error })
    }
    const scriptPath = path.join(__dirname, '../genai_models/st2nar.py');

    try {
        const response = await pythonConnect(res, scriptPath, pythonst2nar);
        if (response) {
            return res.json({ sucess: true, msg: "Data is ready" })
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


module.exports = router;