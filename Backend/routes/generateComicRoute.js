const express = require("express");
const path = require("path");
const spawn = require('child_process').spawn;
const fs = require('fs');


const comicRoute = express.Router();

async function python_genrating_image(args) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [...args]);
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
                return reject({
                    success: false,
                    error: "Message too long or internal error occurred.",
                    details: errorOutput
                });
            }
            resolve();
        });
    })
}

async function generating_images(page_no, comic_path) {
    return new Promise((resolve, reject) => {
        const Comic_Image_Path = comic_path
        const BASE_URL = "https://3000-01jtxam73atjx6847zgzf8tzjk.cloudspaces.litng.ai";
        try {
            fs.readdir(Comic_Image_Path, (err, files) => {
                if (err) {
                    console.log(err);
                }
                const urls = files.map(file => `${Comic_Image_Path}/${file}`)
                const bubble_files = files.filter(urls => urls.endsWith("with_bubbles.png"))
                const send_bubble_files = bubble_files.map(files => `${BASE_URL}/output/temp_story_comic_page_${page_no}_with_bubbles/${files}`);
                resolve(send_bubble_files);
            })
        } catch (error) {
            console.log("No Folder exists: " + error);
        }
    })
}

comicRoute.post('/generateComic', async (req, res) => {
    const { inferenceSteps2, guidanceScale2, seed2, page_no, artStyle, height_width, themeStyle, fontStyle } = req.body;
    const scriptPath = path.join(__dirname, "../genai_models/inference.py")
    const storyPath = path.join(__dirname, "../pythonInput/temp_story_comic.md");
    const Comic_Image_Path = path.join(__dirname, `../output/temp_story_comic_page_${page_no}_with_bubbles`);

    try {
        await python_genrating_image([scriptPath, storyPath, page_no, artStyle, JSON.stringify(height_width), guidanceScale2, inferenceSteps2, themeStyle, fontStyle, seed2]);
        const send_bubble_files = await generating_images(page_no, Comic_Image_Path);
        return res.status(200).send(send_bubble_files)
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to generate comic panels.",
            error: error.details || error
        });
    }
})


comicRoute.post('/regenerateComic', async (req, res) => {
    const { inferenceSteps2, guidanceScale2, seed2, page_no, height_width, themeStyle, fontStyle, selectedPanel, prompt } = req.body;
    const scriptPath = path.join(__dirname, "../genai_models/panel_regenerate.py")
    const storyPath = path.join(__dirname, "../pythonInput/temp_story_comic.md");

    const extracted_width = (height_width[selectedPanel - 1][0]).replace("px", "");
    const extracted_height = (height_width[selectedPanel - 1][1]).replace("px", "");
    const comic_path = path.join(__dirname, `../output/temp_story_comic_page_${page_no}_with_bubbles`);
    try {
        await python_genrating_image([scriptPath, storyPath, page_no, selectedPanel, prompt, guidanceScale2, inferenceSteps2, extracted_width, extracted_height, themeStyle, fontStyle, seed2]);
        const send_bubble_files = await generating_images(page_no, comic_path);
        // console.log(send_bubble_files);
        return res.status(200).send(send_bubble_files)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Failed to generate comic images.",
            error: error.details || error
        })
    }

})

module.exports = comicRoute