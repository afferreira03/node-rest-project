const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    const authorizationToken = req.get('Authorization');
    let decodeToken;

    if(!authorizationToken) {
        const error = new Error("Not Authenticated!");
        error.statusCode = 401;
        throw error;
    }

    try {
        decodeToken = jwt.verify(authorizationToken.split(' ')[1], config.get('secret.key'));    
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }

    if(!decodeToken){
        const error = new Error("Not Authenticated!");
        error.statusCode = 401;
        throw error;        
    }
    req.userId = decodeToken.userId;
    next();
}