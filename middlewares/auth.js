const jwt = require("jsonwebtoken");
const funcs = require('./../functions/functions');

exports.authToken = (req,res,next) => {
    try {
        const now = new Date().getTime() / 1000
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        if (now < decodedToken.exp) {
            next();
        } else {
            return funcs.sendError(res, "Token expiré !");
        }
    } catch (error) {
        return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 504-2 & 413)");
    }
};

exports.findLoginInToken = (req, res, next) => {
    const token = req.body.token;
    const now = new Date().getTime() / 1000;
    try {
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
        const login = decodedToken.login;
        if (login != undefined && now < decodedToken.exp) {
            console.log("found   " + login)
            req.body.login = login;
            next();
        } else {
            return funcs.sendError(res, "Token expiré !");
        }
    } catch(err) {
        return funcs.sendError(res, "Token error", err);
    }
}
