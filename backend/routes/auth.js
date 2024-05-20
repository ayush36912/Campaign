const express = require('express');
const { body, check } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user')
const router = express.Router()

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.post('/login',[
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password','Password has to be valid.')
    .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
    .trim(),
], authController.postLogin);
router.post('/signup',[
    body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .custom((value, { req }) => {
        return User.findOne({email: value})
        .then(userDoc => {
        if(userDoc) {
        return Promise.reject('Email exists already,please pick a different one.')
    }
    })
    })
    .normalizeEmail(),
    body('password','password has to be valid')
    .isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
    body('mobile_No').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number')
    .trim(),
    body('address')
    .isLength({ min: 8 }).withMessage('Address must be at least 8 characters long')
    .isLength({ max: 50 }).withMessage('Address must be at most 50 characters long'),
], authController.postSignup);
router.get('/checkAuthStatus', authController.checkAuthStatus);
router.post('/logout', authController.postLogout);
router.post('/resetPassword', authController.sendResetPasswordEmail);
router.post('/reset/:token', authController.postNewPassword);
router.get('/reset/:token', authController.getNewPassword);

module.exports = router;