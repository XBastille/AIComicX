const express = require("express");
const path = require("path");
const spawn = require('child_process').spawn;
const fs = require('fs');

const panelRoute = express.Router();


//panel_prompt_data:
panelRoute.post("/get_panel_prompt", async (req, res) => {

    const { pageNo } = req.body;
    try {
        const location = path.join(__dirname, "../genai_models/output/temp_story_comic_prompts.json");
        const file = fs.readFileSync(location, 'utf8');
        const file_data = JSON.parse(file);
        const page_key = `page_${pageNo + 1}`
        const value = file_data.panel_prompts[page_key]
        res.json({ success: "true", msg: value })
    } catch (error) {
        console.log("cannot read the promptFile :" + error);
    }

})


panelRoute.get('/panel_data', async (req, res) => {
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

module.exports = panelRoute;