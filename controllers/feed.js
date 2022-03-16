exports.getPosts = (req, res, next) =>{
    res.status(200).json({
        posts: [
            {
                _id: '1',
                title: 'This is the first post!',
                content: 'This is the first post of this blog',
                imageUrl: 'images/token_allain.png',
                creator: {
                    name: 'Dummy Author'
                },
                createdAt: new Date()
            }
        ]
    });
}

exports.createPost = (req, res, next) => {
    const title = req.body.title; 
    const content = req.body.content;
    res.status(201).json({
        message: 'Post created.',
        post: {
            _id : new Date().toISOString(),
            title: title,
            content: content,
            creator: {
                name: 'Alan',
            },
            createdAt: new Date()
        }
    })
}