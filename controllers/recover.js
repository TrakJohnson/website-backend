const funcs = require('../functions/functions')
const jwt = require("jsonwebtoken");
const {google} = require('googleapis');

exports.checkInfos = (req, res, next) => {
    // inscription des informations dans la base de données de récupération de mots de passe, puis création du token et envoi à la fonction suivante
    // on commence par vérifier la cohérence login-email (et l'existence du compte)
    funcs.bddQuery(req.conBDA, 'SELECT email FROM newUsers WHERE login = ?', [req.body.loginToChangePassword])
    .then((data) => {
        // Generation du WebToken
        req.body.token = jwt.sign(
            {login : req.body.loginToChangePassword},
            'RANDOM_TOKEN_SECRET',
            { expiresIn: '24h'} 
        )
        if (data[0].email != req.body.emailAdressToSend) {
            return funcs.sendError(res, "Erreur, email non reconnu", {message : "Mail adress not recognized"})
        }
        else {
            next()
        }
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, login non reconnu.", error);});
}




exports.sendRecoverMail = (req, res, next) => {
    emailOptions = {
        from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
        to: req.body.emailAdressToSend, // list of receivers
        subject: "[BDA] Changement de mot de passe", // Subject line
        html : `
            <p>Bonjour,</p> 
            <p>Tu as demandé à changer ton mot de passe sur le site du BDA, si cela n'est pas le cas, contacte les administrateurs. 
            <br>Pour changer ton mot de passe, clique sur ce lien : 
            <br><br> https://bda-minesparis.fr/recover/change-password/${req.body.token}
            <br><br> <i>Attention : ce lien n'est valable que 24h.</i> </p>`
    }

    funcs.sendMail(emailOptions)
    .then((result) => {
        funcs.sendSuccess(res, {message : "Un mail a été envoyé, merci de consulter votre boîte mail."})
    })
    .catch((err) => {
        console.log("Erreur lors de l'envoi du msg de récupération")
        console.log(err)
        return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 302 & 412)", error)
    })
};


exports.changePassword = (req, res, next) => {

    funcs.bddQuery(req.conBDA, "UPDATE newUsers SET password = ? WHERE login = ?", [req.body.newPassword, req.body.login])
    .then(()=>{
        funcs.sendSuccess(res, {message : "Mot de passe changé avec succès"})
    })
    .catch((error) => {
        funcs.sendError(res, "Erreur de changement de mot de passe", error)
    })
    
};

