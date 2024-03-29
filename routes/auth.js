const express = require('express');
const { body } = require('express-validator');

const User = require('../models/user');

const router = express.Router();

const authController = require('../controllers/auth');

router.put('/signup',
    [
        body('email')
            .isEmail()
            .withMessage("Please, enter a valid Email.")
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('Email adress already exists!');
                    }
                });
            })
            .normalizeEmail(),
        body('password').trim().isLength({ min: 5 }),
        body('name').trim().not().isEmpty()
    ],
    authController.singup
)

router.post('/login', authController.login);

module.exports = router;
