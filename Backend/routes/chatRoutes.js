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
    const { message } = req.body;
    console.log(message)
    const scriptPath = path.join(__dirname, '../genai_models/sam.py');

    const pythonProcess = spawn('python', [scriptPath, message]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
        console.log(output)
    });

    pythonProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);

        if (code !== 0 || errorOutput.includes("tokens_limit_reached")) {
            console.error('Python script error or token limit:', errorOutput);
            return res.status(400).json({
                success: false,
                error: "Message too long or internal error occurred.",
                details: errorOutput
            });
        }

        return res.json({
            success: true,
            data: output
        });
    });
});



router.post('/ayush', async (req, res) => {
    const scriptPath = path.join(__dirname, '../genai_models/nar2nar.py');
    const { text } = req.body;
    const tempInputFile = path.join(__dirname, '../pythonInput/temp_story.txt');

    try {
        fs.writeFileSync(tempInputFile, text);
    } catch (writeError) {
        console.error('Error writing temp file:', writeError);
        return res.status(500).json({ error: 'Failed to write input file' });
    }

    const pythonProcess = spawn('python', [scriptPath, tempInputFile, '--silent']);

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

        let comicContent = "";
        const startMarker = "COMIC_CONTENT_START";
        const endMarker = "COMIC_CONTENT_END";

        const startIndex = output.indexOf(startMarker);
        const endIndex = output.indexOf(endMarker);

        if (startIndex !== -1 && endIndex !== -1) {
            const startPos = output.indexOf('\n', startIndex) + 1;
            const endPos = output.lastIndexOf('\n', endIndex);
            comicContent = output.substring(startPos, endPos).trim();
        } else {
            comicContent = output;
        }

        console.log("Extracted comic content length:", comicContent.length);

        const outputPath1 = path.join(__dirname, "../SamtoGen/story.md");
        const outputPath2 = path.join(__dirname, "../pythonInput/temp_story_comic.md");

        fs.writeFile(outputPath1, comicContent, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Failed to write output file' });
            }

            fs.writeFile(outputPath2, comicContent, (err2) => {
                if (err2) {
                    console.log(err2);
                    return res.status(500).json({ error: 'Failed to write temp comic file' });
                }
                return res.json({ result: comicContent, sucess: true });
            });
        });
    });
});

router.get('/mdToFront', async (req, res) => {
    try {
        const storyPath = path.join(__dirname, "../pythonInput/temp_story_comic.md");

        if (!fs.existsSync(storyPath)) {
            return res.status(404).json({ error: 'Story not found' });
        }

        const storyContent = fs.readFileSync(storyPath, 'utf-8');

        return res.json(storyContent);
    } catch (error) {
        console.error('Error reading story file:', error);
        return res.status(500).json({ error: 'Failed to read story file' });
    }
});


router.post('/generateComic', async (req, res) => {
    const { inferenceSteps2, guidanceScale2, seed2, page_no, artStyle, height_width } = req.body;
    const scriptPath = path.join(__dirname, "../genai_models/inference.py")
    const storyPath = path.join(__dirname, "../pythonInput/temp_story_comic.md");
    // const pythonProcess = await spawn('python', [scriptPath, storyPath, page_no, artStyle, JSON.stringify(height_width), guidanceScale2, inferenceSteps2]);
    // console.log(page_no, artStyle, height_width, guidanceScale2, inferenceSteps2)
    // console.log("coming inside /generate comics")
    // let output = '';
    // let errorOutput = '';

    // pythonProcess.stdout.on('data', (data) => {
    //     output += data.toString();
    //     console.log(output)
    // });

    // pythonProcess.stderr.on('data', (data) => {
    //     errorOutput += data.toString();
    // });

    // pythonProcess.on('close', (code) => {
    //     console.log(`Python process exited with code ${code}`);

    //     if (code !== 0 || errorOutput.includes("tokens_limit_reached")) {
    //         console.error('Python script error or token limit:', errorOutput);
    //         return res.status(400).json({
    //             success: false,
    //             error: "Message too long or internal error occurred.",
    //             details: errorOutput
    //         });
    //     }
    // });

    const Comic_Image_Path = path.join(__dirname, `../output/temp_story_comic_page_${page_no}_with_bubbles`);
    const BASE_URL = "https://3000-01jtxam73atjx6847zgzf8tzjk.cloudspaces.litng.ai";
    try {
        fs.readdir(Comic_Image_Path, (err, files) => {
            if (err) {
                console.log(err);
            }
            const urls = files.map(file => `${Comic_Image_Path}/${file}`)
            const bubble_files = files.filter(urls => urls.endsWith("with_bubbles.png"))
            const send_bubble_files = bubble_files.map(files => `${BASE_URL}/output/temp_story_comic_page_${page_no}_with_bubbles/${files}`);
            return res.status(200).send(send_bubble_files)
        })
    } catch (error) {
        console.log("No Folder exists: " + error);
    }
})

router.get('/panel_data', async (req, res) => {
    try {
        const location = path.join(__dirname, "../genai_models/output/character_descriptions.json");
        const file = fs.readFileSync(location);
        const file_data = JSON.parse(file);
        return res.json(file_data.comic_structure.panels_per_page)
    } catch (error) {
        console.error("Error reading panel data:", error);
        return res.status(500).json({ error: "Failed to load panel data" });
    }
})

module.exports = router;