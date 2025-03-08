const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    google_id: {
        type: String,
    },
    github_id: {
        type: String,
    },
    provider: {
        type: String,
    }
})

module.exports = mongoose.model('User', userSchema);