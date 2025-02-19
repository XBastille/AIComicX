const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/project2').then(() => {
    console.log('Connection Eshtablished');

}).catch((e) => {
    console.log('maa chudi h database nhi ho raha h connect');
    console.log(e);


})

