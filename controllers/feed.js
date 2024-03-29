const fs = require('fs');
const path = require('path');
const Post = require('../models/post');
const User = require('../models/user');
const { validationResult } = require('express-validator');

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;

    Post.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage);
        })
        .then(posts => {
            if (!posts) {
                const error = new Error('Post doesn\'t  exist.');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({ message: '', posts: posts, totalItems: totalItems });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validations failed, entered data is incorrect.');
        error.status = 422;
        throw error;
    }

    if (!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path.replace('\\', '/');
    const title = req.body.title;
    const content = req.body.content;
    let creator;
    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId
    });

    post.save()
        .then(result => {
            console.log(result);
            return User.findById(req.userId)
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            return user.save()
        })
        .then(res => {
            res.status(201)
                .json({
                    message: 'Post created.',
                    post: post,
                    creator: { _id: creator._id, neme: creator.neme }
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post doesn\'t  exist.');
                error.statusCode = 404;
                throw error;
            }

            res.status(200).json({
                message: 'post fetch',
                post: post
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err)
        });
};

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    const postId = req.params.postId;

    if (!errors.isEmpty()) {
        const error = new Error('Validations failed, entered data is incorrect.');
        error.status = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image.replace('\\', '/');

    if (req.file) {
        imageUrl = req.file.path.replace('\\', '/');
    }

    if (!imageUrl) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post doesn\'t  exist.');
                error.statusCode = 404;
                throw error;
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl);
            }

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl;
            return post.save();
        })
        .then(result => {
            res.status(200).json({ message: 'Post Updated', post: result });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId;

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post doesn\'t  exist.');
                error.statusCode = 404;
                throw error;
            }

            clearImage(post.imageUrl);

            return Post.findByIdAndRemove(postId)
        })
        .then(result => {
            res.status(200).json({ message: 'Post deleted.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        })
}

const clearImage = filePath => {
    const imagePath = path.join(__dirname, '..', filePath);
    fs.unlink(imagePath, err => console.error(err));
}