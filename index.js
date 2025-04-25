const express = require('express');
const session = require('express-session');
const cors = require('cors')
require('dotenv').config();

const app = express();
// require('./database/connection');

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

//hii bro
app.listen(3000, () => {
    console.log("Server is listening to port 3000");
})