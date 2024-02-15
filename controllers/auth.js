const { validationResult } = require('express-validator');
const User = require('../models/user');
const bcript = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

exports.singup = (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcript.hash(password, 12)
        .then(hashPassword => {
            const user = new User({
                name: name,
                email: email,
                password: hashPassword
            });
            return user.save();
        })
        .then(user => {
            res.status(201).json({
                message: 'User created.',
                userId: user._id
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error("User not found!");
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcript.compare(password, user.password);
        })
        .then(isEqueal => {
            if (!isEqueal) {
                const error = new Error("Wrong password mate =/.");
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                config.get("secret.key"),
                { expiresIn: '1h' }
            );

            res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}