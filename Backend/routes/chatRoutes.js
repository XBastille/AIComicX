const express = require("express");
const path = require("path");
const spawn = require('child_process').spawn;
const fs = require('fs');

const chatRoute= express.Router();


chatRoute.post('/ayush', async (req, res) => {
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

chatRoute.get('/mdToFront', async (req, res) => {
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


module.exports = chatRoute;