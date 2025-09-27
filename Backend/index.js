const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

const requiredDirs = [
    path.join(__dirname, 'pythonInput'),
    path.join(__dirname, 'SamtoGen'),
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'response')
];

requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

const frontendBuildPath = path.join(__dirname, '../Frontend/dist');
app.use(express.static(frontendBuildPath));

app.use('/', require('./routes/indexRoute'));

app.use('/output', express.static(path.join(__dirname, 'output')));

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'Backend is working!'
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

app.listen(3000, () => {
    console.log("Server is listening to port 3000");
})