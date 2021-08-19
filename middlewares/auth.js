const jwt = require("jsonwebtoken");

exports.authToken = (req,res,next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const login = decodedToken.login;
        if (req.body.loginSender && req.body.loginSender == login) {
            next();
        } else {
            return funcs.sendError(res, "Erreur lors de la vérification du token! (code erreur : 504-1)");
        }
    } catch (error) {
        return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 504-2 & 413)");
    }
};

exports.findLoginInToken = (req, res, next) => {
    const token = req.body.token;
    var decodedToken = new String;
    try {
        decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
        const login = decodedToken.login;
        if (login != undefined) {
            req.body.login = login;
            next();
        }
    } catch(err) {
        return funcs.sendError(res, "Token error", err);
    }
}
