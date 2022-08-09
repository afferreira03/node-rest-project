const Post = require('../models/post');
const { validationResult } = require('express-validator');

exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
            if (!posts) {
                const error = new Error('Post doesn\'t  exist.');
                error.statusCode = 404;
                throw error;
            }

            res.status(200)
                .json({
                    posts: posts
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validations failed, entered data is incorrect.');
        error.status = 422;
        throw error;
    }

    if(!req.file) {
        const error = new Error('No image provided');
        error.statusCode = 422;
        throw error;
    }

    const imageUrl = req.file.path.replace('\\', '/');
    const title = req.body.title;
    const content = req.body.content;
        const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'Alan',
        }
    });

    post.save()
        .then(result => {
            console.log(result);
            res.status(201)
                .json({
                    message: 'Post created.',
                    post: result
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
}