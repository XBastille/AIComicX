const express = require('express');
const session = require('express-session');
require('dotenv').config();

const app = express();
require('./database/connection');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use("", require('./routes/authRoutes'));

app.get('/', (req, res) => {
    res.send('home page');
})


app.listen(3000, () => {
    console.log("Server is listening to port 3000");
})