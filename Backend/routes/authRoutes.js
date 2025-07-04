const express = require('express');
const schema = require('../model/schema');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const passport = require('passport');
require('../passport');

const router = express.Router();


//___________________________________SIGN UP______________________________________________________________
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
    console.log("login ke andar")
    let error = [];
    try {
        const { email, password } = req.body;
        console.log(password)
        if (!email || !password) {
            error.push({ msg: "Fill the form properly" })
        }
        const exist = await schema.findOne({ email: email });
        if (!exist) {
            error.push({ msg: "User not found" })
        }

        const same = await bcrypt.compare(password, exist.password);
        console.log('same wala line run ho gaya h');
        if (!same) {
            error.push({ msg: "Password incorrect" })
        }

        if (error.length > 0) {
            return res.json({ sucess: false, msg: "Re render the form", error })
        }
        req.session.userId = exist._id;
        return res.json({
            sucess: true,
            message: 'user found'
        })
    } catch (error) {
        console.log(error);
    }
})

//______________________________GOOGLE AUTH___________________________________________________________________

// router.get('/auth/google', passport.authenticate('google', {
//     scope:
//         ['email', 'profile']
// }));

// router.get('auth/google/callback', passport.authenticate('google', {
//     successRedirect: '/success',
//     failureRedirect: '/faliure'
// }));

// router.get('/success', (req, res) => {
//     console.log(req.user);
//     res.json({
//         sucess: true,
//         message: 'successfull authentication',
//     })
// })

// router.get('/faliure', (req, res) => {
//     res.json({
//         sucess: false,
//         message: 'failed to authenticate'
//     })
// })


// //__________________GITHUB AUTH_________________________________________________
// app.get('/auth/github',
//     passport.authenticate('github', { scope: ['user:email'] }));

// app.get('/auth/github/callback',
//     passport.authenticate('github', { failureRedirect: '/login' }),
//     function (req, res) {

//         res.json('/');
//     });

module.exports = router;