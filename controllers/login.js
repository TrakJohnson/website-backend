const funcs = require('../functions/functions');
const jwt = require('jsonwebtoken');
const { currentDate } = require('../functions/functions');

exports.login = (req, res, next) => {

    // Gathering information of account in database
    funcs.bddQuery(req.conBDA, 'SELECT password FROM newUsers WHERE login = ?', [req.body.login])
    .then((data) => {
        if (data != undefined & data.length > 0) {
            // Gather true password's infos
            const truePwdInfos = data[0].password;

            if (truePwdInfos == req.body.password) {
                console.log("authentified ! ");

                // Update last connection date of this user
                funcs.bddQuery(req.conBDA, 'UPDATE newUsers SET date_last_con = ? WHERE login = ?', [currentDate(), req.body.login])

                return funcs.sendSuccess(res, {
                    token : jwt.sign(
                        {login : req.body.login},
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '24h'}
                    )
                });  
            } else {
                return funcs.sendError(res, "Mot de passe incorrect !");

            }
        } else { // Login not found :/
            return funcs.sendError(res, "Ce login n'existe pas !");
        }
    }) 
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
};

exports.createAccount = (req, res, next) => {

    const body = req.body;
    if (body.loginToAdd == undefined, body.prenom == undefined, body.nom == undefined, body.email == undefined, body.password == undefined, body.admin == undefined, body.contributor == undefined) {
        return funcs.sendError(res, "Il manque des informations pour créer le compte !");
    }

    // We have all info we need to create account
    const creationDate = currentDate();
    const lastConDate = currentDate();

    funcs.bddQuery(req.conBDA, 'INSERT INTO newUsers (login, prenom, nom, email, password, admin, contributor, date_creation, date_last_con, promo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?); ', [body.loginToAdd, body.prenom, body.nom, body.email, body.password, body.admin, body.contributor, creationDate, lastConDate, body.promo? body.promo : null])
    .then(() => {return funcs.sendSuccess(res, {message : "Création de compte réussie !"});})
    .catch((error) => {return funcs.sendError(res, "Erreur lors de la création du compte");})
}