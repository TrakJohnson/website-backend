const funcs = require('../functions/functions');
const jwt = require('jsonwebtoken');
const { currentDate } = require('../functions/functions');
const Account = require('../models/account');

getDemandedPlacesStatus = (conBda, login) => {

    return new Promise(function(resolve, reject) {

        funcs.bddQuery(conBDA, "SELECT * FROM newPlaces WHERE login = ?", [login])
        .then((data) => {
            if (data == undefined || data.length < 1) {
                resolve([]);
            } else {
                var placesToSendFront = [];
                data.forEach(place => {
                    placesToSendFront.push(place);
                });
                resolve(placesToSendFront);
            }
        })
        .catch((error) => reject(error));
    });

}

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
                .then(() => {
                    funcs.bddQuery(req.conBDA, 'SELECT * FROM newUsers WHERE login = ?', [req.body.login])
                    .then((data) => {
                        if (data == undefined || data.length == 0) {
                            return funcs.sendError(res, "Login non reconnu", error);
                        }
                        getDemandedPlacesStatus(req.conBda, req.body.login)
                        .then((dataPlaces) => {
                            data[0].placesDemanded = dataPlaces;
                            const compteUser = new Account(data[0]);
                            return funcs.sendSuccess(res, {
                                token : jwt.sign(
                                    {login : req.body.login},
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: '2h'}
                                ),
                                compte : compteUser
                            });  
                        });
                    })
                    .catch((error) => {return funcs.sendError(res, "Login non reconnu", error);});
                })
                .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
            } else {
                return funcs.sendError(res, "Mot de passe incorrect !");
            }
        } else { // Login not found :/
            return funcs.sendError(res, "Ce login n'existe pas !");
        }
    }) 
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
};

exports.loginFromToken = (req, res, next) => {


    const token = req.body.token
    var decodedToken = new String;
    try {
        decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET')
    } catch(err) {
        return funcs.sendError(res, "Token error", err);
    }


    const login = decodedToken.login;
        
    funcs.bddQuery(req.conBDA, 'UPDATE newUsers SET date_last_con = ? WHERE login = ?', [currentDate(), req.body.login])
    .then(() => {
        funcs.bddQuery(req.conBDA, 'SELECT * FROM newUsers WHERE login = ?', [login])
        .then((data) => {
            if (data == undefined || data.length == 0) {
                return funcs.sendError(res, "Login non reconnu", error);
            }
            getDemandedPlacesStatus(req.conBda, req.body.login)
            .then((dataPlaces) => {
                data[0].placesDemanded = dataPlaces;
                const compteUser = new Account(data[0]);
                return funcs.sendSuccess(res, {
                    token : token,
                    compte : compteUser
                });  
            });
        })
        .catch((error) => {return funcs.sendError(res, "Login non reconnu", error);});
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
}
     
        

exports.createAccount = (req, res, next) => {
    console.log({"coucou0" : req.body});

    const body = req.body;
    if (body.loginAccountCreated && body.prenom && body.nom && body.email && body.password && body.admin && body.contributor) {
        return funcs.sendError(res, "Il manque des informations pour créer le compte !");
    }

    console.log("coucou1");

    // We have all info we need to create account
    const creationDate = currentDate();
    const lastConDate = currentDate();

    funcs.bddQuery(req.conBDA, 'INSERT INTO newUsers (login, prenom, nom, email, email_verified, password, admin, contributor, date_creation, date_last_con, promo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); ', [body.loginAccountCreated, body.prenom, body.nom, body.email, false /*email verified : no*/, body.password, body.admin, body.contributor, creationDate, lastConDate, body.promotion])
    .then(() => {console.log("coucou2"); next()})
    .catch((error) => {console.log(error); return funcs.sendError(res, "Erreur lors de la création du compte");})
}

exports.createDemandVerification = (req, res, next) => {
    let num = Math.floor(Math.random() * (1_000_000_000));
    let hash = funcs.hash(num.toString());
    let DateCreation = funcs.currentDate();
    console.log({"coucou3" : hash, num : num});

    // inscription des informations dans la base de données de récupération de mots de passe, puis création du token et envoi à la fonction suivante
    funcs.bddQuery(req.conBDA, "INSERT INTO VerificationEmail (login, code, dateDemand) VALUES (?, ?, ?)", [req.body.loginAccountCreated, hash, DateCreation])
    .then(() => {
        // Generation du WebToken
        console.log("coucou4");
        req.body.hash = hash;
        next();
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 204 & 402)", error);});
}

exports.SendVerificationEmail  = (req, res, next) => {

    // Email for verification of address mail
    console.log("coucou5");

    email1Options = {
        from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "[BDA] Verification adresse mail", // Subject line
        html : "<p> Bonjour, </p> <p> tu as créé un compte avec cet email sur le site du Rezal, si cela n'est pas le cas, contacte les administrateurs. <br> Pour vérifier cet email, clique sur ce lien : <br> 'http://localhost:4200/register/verify-email/" + req.body.token + " </p>"
    }

    // Email with connection IDs (login & password)

    email2Options = {
        from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "[BDA] Verification adresse mail", // Subject line
        html : "<p> Bonjour, </p> <p> Tes informations de connexion sont : </p> <br> login : " + req.body.loginAccountCreated + "<br> Mot de passe : celui entré lors de la création de ton compte"
    }

    funcs.sendMail(email1Options)
    .then(() => {
        console.log("Email 1 sent");
        funcs.sendMail(email2Options)
        .then (() => {
            console.log("Email 2 sent");
            return funcs.sendSuccess(res, {message : "Utilisateur créé !", loginAssigned : req.body.loginAccountCreated});
        })
        .catch((err) => {
            console.log(err)
            return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-1 & 405)", error);
        })
    })
    .catch((err) => { 
        return funcs.sendSuccess(res, {message : "Utilisateur créé !", loginAssigned : req.body.loginAccountCreated});
    })
};


exports.VerifyEmail = (req, res, next) => {

    // Le compte à qui on doit vérifier le mot de passe a son login enregistré dans la table 'VerificationEmail'

    // On récupère le login
    funcs.bddQuery(req.conBDA, 'SELECT login FROM VerificationEmail WHERE code = ?', [req.body.code])
    .then((data) => {
        console.log("coucou9");

        if (data != undefined && data.length > 0) {
            loginToVerifyEmail = data[0].login;
        }

        // On met à jour le compte correspondant
        funcs.bddQuery(req.conBDA, "UPDATE newUsers SET emailVerifie = 1 WHERE login = ?", [loginToVerifyEmail])
        .then(() => {

            // Enfin on détruit le code
            funcs.bddQuery(req.conBDA, 'DELETE FROM VerificationEmail WHERE code = ?', [req.body.code])
            .then(() => {return funcs.sendSuccess(res, {message : "Email accepté avec succès"});})
            .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);})
        })
        .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);})
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);})        
}