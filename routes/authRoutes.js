const express = require('express');
const schema = require('../model/schema');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/signup', async (req, res) => {
    console.log('signup k andar');

    try {
        const { userName, email, password } = req.body;
        console.log('try k andar');
        if (!userName || !email || !password) {
            console.log('not passward wala check');
            return res.status(500).send({
                sucess: false,
                message: 'please fill all the feilds ',
            })
        }

        const exist = await schema.findOne({ email: email })
        if (exist) {
            console.log('exist wala check');
            return res.status(500).send({ // render the register pge 
                sucess: true,
                message: 'user already exit try to sinup',
            })
        }
        console.log('salt se pahele ka line');
        var salt = bcrypt.genSaltSync(15);
        console.log('salt wala line run kr raha h');
        const newPassword = await bcrypt.hash(password, salt);
        console.log('new password create ho gaya ');
        console.log(password);
        console.log(newPassword);


        const newuser = await schema.create({
            userName: userName,
            email: email,
            password: newPassword,
        })
        req.session.userId = newuser._id;
        res.status(201).send({
            sucess: true,
            message: 'new User Created'
        })
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
})

router.post('/login', async (req, res) => {
    // res.send('login k andar');
    try {
        const { userName, email, password } = req.body;
        if (!userName || !email || !password) {
            return res.status(500).send({
                sucess: false,
                message: 'form pura bharo'
            })
        }
        const exist = await schema.findOne({ email: email });
        if (!exist) {
            return res.status(500).send({ // yaha wapas login render krwa dena h with msg ki email not registered
                sucess: false,
                message: 'user not found'
            })
        }

        const same = await bcrypt.compare(password, exist.password);
        console.log('same wala line run ho gaya h');
        if (!same) {
            return res.status(500).send({ // yaha wapas login render krwa dena h with msg ki password incorrect
                sucess: false,
                message: 'password incorrect',
            })
        }
        req.session.userId = exist._id;
        res.status(200).send({ // yaha render krwayenge login k baad 
            sucess: true,
            message: 'user found'
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;