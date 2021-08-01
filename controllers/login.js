const funcs = require('../functions/functions');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

exports.login = (req, res, next) => {

    // Récupération des informations du compte dans la base de données des comptes définitifs
    funcs.bddQuery(req.conPortail, 'SELECT password FROM auth_user WHERE username = ?', [req.body.login])
    // funcs.bddQuery(req.conPortail, 'SELECT * FROM auth_user')
    .then((data) => {
        if (data != undefined & data.length > 0) {
            // Gather true password's infos
            const truePwdInfos = data[0].password.split('$');
            if (truePwdInfos.length < 4) { // Must have 4 items at least
                // Qqchose ne va pas bien
                return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur");

            }
            const [truePwddecoded, salt, iterations, algorithm] =  [Buffer.from(truePwdInfos[3], 'base64').toString("hex"), truePwdInfos[2], parseInt(truePwdInfos[1]), "SHA256"]
            const pwdToHash = Buffer.from(req.body.password, 'utf-8').toString();

            crypto.pbkdf2(pwdToHash,salt, iterations, 32, algorithm, (err, derivedKey) => {
                if (err == null && derivedKey.toString("hex") == truePwddecoded) { // Mot de passe correct
                    return funcs.sendSuccess(res, {
                        token : jwt.sign(
                            {login : req.body.loginAdmin},
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h'}
                        )
                    }); 
                } else { // Mot de passe incorrect
                    return funcs.sendError(res, "Mot de passe incorrect !");
                }
            })
        } else { // Login pas trouvé
            return funcs.sendError(res, "Ce login n'existe pas !");
        }
    }) 
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
};