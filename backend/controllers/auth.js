const User = require('../models/user');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'niralipatel1362@gmail.com',
        pass: 'qybr muak osev cdcf' 
    }
});

exports.getSignup = async  (req, res) => {
    try{
        const user = await User.find();
        if(!user){
            throw new Error("No user found!");
        }
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({ message: err.message });
    }
};

exports.postSignup = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    const user = new User(req.body);
    try{
        const newUser = await user.save();
        res.status(201).json(newUser);
    }catch(err){
        console.log(err);
        return res.status(400).json({ message: err.message });
    }
}

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    try {
        const user = await User.findOne({ email, password });
        if (!user) {
            return res.status(404).json({ message: "User not found or invalid credentials" });
        }
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err => {
            if(err){
                res.status(500).json({ message: "Session could not be saved" });
            }else{
                res.status(200).json({ message: "Login successful", user });
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.getLogin = async (req, res) => {
    res.status(200).json({ message: `Login page` });
    //console.log('login:',req.user);
}

exports.postLogout = (req, res) => {
    req.session.destroy(err=> {
        if(err){
            res.status(500).json({ message: "Error occurred during logout", error: err });
        } else {
            res.status(200).json({ message: "Logout successful", user:req.user });
        }
    });
}

exports.checkAuthStatus = (req, res) => {
    res.json({ isLoggedIn: req.session.isLoggedIn });
};

exports.sendResetPasswordEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const token = crypto.randomBytes(20).toString('hex');
        console.log(token);
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; 

        await user.save();

        // Email content
        const mailOptions = {
            from: 'niralipatel1362@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this because you have requested the reset of the password for your account.\n\n`
                + `Please click on the following link, or paste this into your browser to complete the process:\n\n`
                + `http://localhost:5173/reset/${token}\n\n`
                + `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
                return res.status(500).json({ message: error.message });
            }
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Password reset email sent successfully.' });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.postNewPassword = async (req, res) => {
    const { newPassword} = req.body;
    const token = req.params.token;
    console.log(newPassword);
    console.log(token);

    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() }})

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        // Update user's password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

exports.getNewPassword = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(404).json({ message: "Invalid or expired token" });
        }

        res.status(200).json({ email: user.email, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

