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

app.use("/user", require('./routes/authRoutes'));
app.use("/chat", require('./routes/chatRoutes'));

app.get('/', (req, res) => {
    res.send('home page');
})

app.listen(3000, () => {
    console.log("Server is listening to port 3000");
})