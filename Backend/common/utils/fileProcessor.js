const path = require("path")
const fs = require('fs')
const pdf = require("pdf-parse");
const mammoth = require("mammoth");


async function extractText(fileName, filePath, ext) {
    try {
        if (ext === '.pdf') {
            let dataBuffer = fs.readFileSync(filePath);
            pdf(dataBuffer).then(function (data) {
                try {
                    fs.writeFileSync(fileName, data.text);
                } catch (error) {
                    console.log('Error in writing the file', error);
                }

            });
        }

        else if (ext === '.txt') {
            const data = fs.readFileSync(filePath, "utf-8");
            try {
                fs.writeFileSync(fileName, data);
            } catch (error) {
                console.log('Error in writing the file', error);
            }
        }

        else if (ext === '.docx') {
            const { value: text } = await mammoth.extractRawText({ path: filePath });
            try {
                fs.writeFileSync(fileName, text);
            } catch (error) {
                console.log("Error in writing the file", error)
            }
        }

        else {
            error.push({ msg: "Unsupported file type" });
            return res.json({ success: false, msg: "Only PDF , TXT and DOCX files allowed", error });
        }

    } catch (error) {
        console.log(error);
    }
}

module.exports = { extractText };