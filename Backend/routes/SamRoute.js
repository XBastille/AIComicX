const express = require("express");
const path = require("path");
const spawn = require('child_process').spawn;

const samRoute = express.Router();

samRoute.post('/transferSam', async (req, res) => {
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

module.exports = samRoute;