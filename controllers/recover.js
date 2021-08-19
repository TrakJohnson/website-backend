const funcs = require('../functions/functions')
const jwt = require("jsonwebtoken");
const {google} = require('googleapis');

exports.checkInfos = (req, res, next) => {
    // inscription des informations dans la base de données de récupération de mots de passe, puis création du token et envoi à la fonction suivante
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
        subject: "[Portail BDA] Changement de mot de passe", // Subject line
        html : "<p> Bonjour, </p> <p> tu as demandé à changer ton mot de passe sur le site du BDA, si cela n'est pas le cas, contacte les administrateurs. <br> Pour changer ton mot de passe, clique sur ce lien : <br> http://localhost:4200/recover/changePassword/" + req.body.token + " </p>"
    }

    funcs.sendMail(emailOptions)
    .then((result) => {
        console.log("Email Sent      " + result);
        funcs.sendSuccess(res, {message : "Un mail a été envoyé, merci de consulter votre boitre mail."})
    })
    .catch((err) => {
        console.log(err)
        return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 302 & 412)", error)
    })
};


exports.changePassword = (req, res, next) => {

    // Le compte à qui on doit changer le mot de passe est soit approuvé soit non approuvé. Si le compte a été supprimé entre temps alors il faudra supprimer le code

    funcs.whereIsAccount(req.con, req.body.loginToChangePassword)
    .then((table) => {
        if (table == "") { // Le compte n'existe pas, il faut supprimer le code de changement de mot de passe
            funcs.bddQuery(req.con, 'DELETE FROM ResiliationMdP WHERE code = ?', [req.body.code])
            .then(() => {return funcs.sendError(res, "Ce compte n'existe plus, le lien n'est plus valable ! (code erreur : 303-1)", error);}) // Suppression terminée envoi de l'erreur au client
            .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur (code erreur : 303-2 & 404)", error);})
        }
        // Le compte existe, on peut donc mettre à jour le mot de passe
        const hash = funcs.hashPassword(req.body.newPassword);
        funcs.bddQuery(req.con, "UPDATE ?? SET password = ? WHERE login = ?", [table, hash, req.body.loginToChangePassword])
        .then(() => {

            // Modification du password dans le radius si le compte y est
            funcs.bddQuery(req.con, "UPDATE radius SET value = ? WHERE login = ?", [hash, req.body.loginToChangePassword])
            .then(() => {
                // Suppression du code qui a maintenant été utilisé
                funcs.bddQuery(req.con, 'DELETE FROM ResiliationMdP WHERE code = ?', [req.body.code])
                .then(() => next()) // On envoie maintenant le mail avec les nouveaux mots de passe
                    // return funcs.sendSuccess(res, {message : "Mot de passe changé avec succès"});})
                .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 303-3 & 404)", error);});
            })
            .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 303-4 & 404)", error);});
        })
        .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 303-5 & 404)", error);});
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 303-6 & 409)", error);});
}

exports.sendNewPasswords = (req, res, next) => {
    emailOptions = {
        from: '"Rezal" <no-reply@rezal-mdm.com>', // sender address
        to: req.body.emailAdressToSend, // list of receivers
        subject: "[REZAL] Nouveau mot de passe", // Subject line
        html : "<p> Bonjour, </p> <p> Voici tes nouveaux identifiants : <br> Identifiant : " + req.body.loginToChangePassword + "<br> Mot de passe : " + req.body.newPassword + "</p>"
    }

    funcs.sendMail(emailOptions, function(error, info) {
        if (error) {
            return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 304 & 412)", error);
        } else {
            return funcs.sendSuccess(res, {message : "Mot de passe changé !"});
        }
    });
};  
