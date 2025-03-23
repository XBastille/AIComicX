const express = require('express');
const schema = require('../model/schema');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const passport = require('passport');
require('../passport');

const router = express.Router();

router.post('/signup', async (req, res) => {
    console.log('signup k andar');

    try {
        const { name, email, password, confirm } = req.body;
        let error = [];
        console.log(name, email, password, confirm)
        console.log('try k andar');

        if (name === '' || email === '' || !password === '' || !confirm === '') {
            error.push({ msg: "Please fill all the blanks" })
        }

        if (!validator.isEmail(email)) {
            error.push({ msg: "Email is not valid" });
        }

        if (password !== confirm) {
            error.push({ msg: "Password mismatch" })
        }

        if (password.length < 6) {
            error.push({ msg: "password is too short" })
        }
        if (error.length > 0) {
            return res.json({ sucess: false, msg: "re render the register", error })
        }

        const exist = await schema.findOne({ email: email })
        if (exist) {
            error.push({ msg: 'username already exist' })
            return res.json({
                sucess: false,
                message: 'user already exits try to sinup',
                error
            })
        }
        var salt = bcrypt.genSaltSync(15);
        const newPassword = await bcrypt.hash(password, salt);


        const newuser = await schema.create({
            name: name,
            email: email,
            password: newPassword,
        })
        req.session.userId = newuser._id;
        return res.json({
            sucess: true,
            message: 'new User Created'
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json('Internal Server Error');
    }
})


//LOGIN_________________________________________________________________________________________

router.post('/login', async (req, res) => {
    try {
        const { userName, email, password } = req.body;
        if (!userName || !email || !password) {
            return res.status(500).json({
                sucess: false,
                message: 'form pura bharo'
            })
        }
        const exist = await schema.findOne({ email: email });
        if (!exist) {
            return res.status(500).json({
                sucess: false,
                message: 'user not found'
            })
        }

        const same = await bcrypt.compare(password, exist.password);
        console.log('same wala line run ho gaya h');
        if (!same) {
            return res.status(500).json({
                sucess: false,
                message: 'password incorrect',
            })
        }
        req.session.userId = exist._id;
        res.status(200).json({
            sucess: true,
            message: 'user found'
        })
    } catch (error) {
        console.log(error);
    }
});

router.get('/auth/google', passport.authenticate('google', {
    scope:
        ['email', 'profile']
}));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/success',
    failureRedirect: '/faliure'
}));

router.get('/success', (req, res) => {
    console.log(req.user);
    res.json({
        sucess: true,
        message: 'successfull authentication',
    })
})

router.get('/faliure', (req, res) => {
    res.json({
        sucess: false,
        message: 'failed to authenticate'
    })
});

app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {

        res.json('/');
    });

module.exports = router;
