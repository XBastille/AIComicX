
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log('Connection Eshtablished');
}).catch((e) => {
    console.log(process.env.MONGODB_URI)
    console.log('Connection Not Eshtablished');
    console.log(e);


});
