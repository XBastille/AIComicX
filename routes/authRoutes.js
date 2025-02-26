const express = require('express');
const schema = require('../model/schema');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const router = express.Router();

router.post('/signup', async (req, res) => {
    console.log('signup k andar');

    try {
        const { userName, email, password, confirmPassword } = req.body;
        console.log('try k andar');
        if (!userName || !email || !password || !confirmPassword) {
            return res.status(500).json({
                sucess: false,
                message: 'please fill all the feilds ',
            })
        }

        if (!validator.isEmail(email)) {
            return res.status(500).json({
                sucess: false,
                message: 'email is not valid please provide valid email'
            })
        }

        if (password === confirmPassword) {
            return res.status(500).json({
                sucess: false,
                message: 'password and confirm password are not same ',
            })
        }

        if (password.length < 6) {
            return res.status(500).json({
                sucess: false,
                message: 'password is too short'
            })
        }

        const exist = await schema.findOne({ email: email })
        if (exist) {
            console.log('exist wala check');
            return res.status(500).json({
                sucess: false,
                message: 'user already exits try to sinup',
            })
        }
        var salt = bcrypt.genSaltSync(15);
        const newPassword = await bcrypt.hash(password, salt);


        const newuser = await schema.create({
            userName: userName,
            email: email,
            password: newPassword,
        })
        req.session.userId = newuser._id;
        res.status(201).json({
            sucess: true,
            message: 'new User Created'
        })
    } catch (error) {
        console.log(error);
        res.status(500).json('Internal Server Error');
    }
})

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
})

module.exports = router;