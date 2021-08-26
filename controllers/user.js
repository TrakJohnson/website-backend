const funcs = require('../functions/functions');
const jwt = require('jsonwebtoken');
const { currentDate, sendError } = require('../functions/functions');
const Account = require('../models/account');
const Place = require('../models/place');

exports.login = (req, res, next) => {
    // Gathering information of account in database
    funcs.bddQuery(req.conBDA, 'SELECT password FROM newUsers WHERE login = ?', [req.body.login])
    .then((data0) => {
        if (data0 != undefined & data0.length > 0) {
            // Gather true password's infos
            const truePwdInfos = data0[0].password;
            if (truePwdInfos == req.body.password) {
                // Update last connection date of this user
                funcs.bddQuery(req.conBDA, 'UPDATE newUsers SET date_last_con = ? WHERE login = ?', [currentDate(), req.body.login])
                .then(() => {
                    funcs.bddQuery(req.conBDA, 'SELECT * FROM newUsers WHERE login = ?', [req.body.login])
                    .then((data) => {
                        if (data == undefined || data.length == 0) {
                            return funcs.sendError(res, "Login non reconnu", error);
                        }
                        funcs.bddQuery(conBDA, "SELECT * FROM newPlaces WHERE login = ?", [req.body.login])
                        .then((data2) => {
                            var placesClaimed = [];
                            if (data2 == undefined || data2.length < 1) {
                                // Rien à faire
                            } else {
                                data2.forEach(place => {
                                    placesClaimed.push(new Place(place));
                                });
                            }
                            data[0].placesClaimed = placesClaimed;
                            const compteUser = new Account(data[0]);
                            return funcs.sendSuccess(res, {
                                token : jwt.sign(
                                    {login : req.body.login},
                                    'RANDOM_TOKEN_SECRET',
                                    { expiresIn: '2h'}
                                ),
                                compte : compteUser
                            }); 
                        })
                        .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
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
    funcs.bddQuery(req.conBDA, 'UPDATE newUsers SET date_last_con = ? WHERE login = ?', [currentDate(), req.body.login])
    .then(() => {
        funcs.bddQuery(req.conBDA, 'SELECT * FROM newUsers WHERE login = ?', [req.body.login])
        .then((dataUser) => {
            if (dataUser == undefined || dataUser.length == 0) {
                return funcs.sendError(res, "Login non reconnu", error);
            }
            funcs.bddQuery(conBDA, "SELECT * FROM newPlaces WHERE login = ?", [req.body.login])
            .then((dataPlaces) => {
                var placesClaimed = [];
                if (dataPlaces == undefined || dataPlaces.length < 1) {
                    // Rien à faire
                } else {
                    dataPlaces.forEach(dataPlace => {
                        placesClaimed.push(new Place(dataPlace));
                    });
                }
                dataUser[0].placesClaimed = placesClaimed;
                const compteUser = new Account(dataUser[0]);
                return funcs.sendSuccess(res, {
                    token : jwt.sign(
                        {login : req.body.login},
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '2h'}
                    ),
                    compte : compteUser
                }); 
            })
            .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
        })
        .catch((error) => {return funcs.sendError(res, "Login non reconnu", error);});
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
}
     
        
exports.claimePlace = (req, res, next) => {
    // D'abord on vérifie que la billetterie existe toujours et qu'elle est ouverte à la vente
    funcs.bddQuery(req.conBDA, "SELECT on_sale FROM newEvents WHERE event_id=?", [req.body.id_billetterie])
    .then(dataUser => {
        if (dataUser == undefined || dataUser.length < 1) {
            funcs.sendError(res, "Cet évènement n'existe plus ou n'est plus en vente", error);
        } else { // Billetterie existe et est encore en vente
            // On vérifie qu'une place n'existe pas déjà à ce nom
            funcs.bddQuery(req.conBDA, "SELECT * FROM newPlaces WHERE event_id=? AND login=?", [req.body.id_billetterie, req.body.login])
            .then((dataPlace) => {
                if (dataPlace.length > 0) {
                    funcs.sendSuccess(res, {message : "Demande enregistrée"});
                } else {
                    // Pas de place à ce nom, on en crée donc une
                    funcs.bddQuery(req.conBDA, "INSERT INTO newPlaces (event_id, login, status, payed) VALUES (?, ?, ?, ?)", [req.body.id_billetterie, req.body.login, -1 /* Place non attribuée au début a priori comme l'évènement est en vente */, 0 /* Place non payée a priori */])
                    .then(() => funcs.sendSuccess(res, {message : "Demande enregistrée"}))
                    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
                }
            })
            .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
        }
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
}

exports.declaimePlace = (req, res, next) => {
    // Pas comme claimePlace, on n'a pas à vérifier si la billetterie existe encore
    // On a juste à demander à retirer la ligne dans la BDD, si elle n'existe pas on ne le détectera pas mais cela n'est pas grave
    funcs.bddQuery(req.conBDA, "DELETE FROM newPlaces WHERE event_id=? AND login=?", [req.body.id_billetterie, req.body.login])
    .then(() => funcs.sendSuccess(res, {message : "Demande retirée"}))
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);});
}

exports.getPlacesClaimedByUser = (req, res, next) => {
    funcs.bddQuery(conBDA, "SELECT * FROM newPlaces WHERE login = ?", [req.query.login])
    .then((data) => {
        if (data == undefined || data.length < 1) {
            return funcs.sendSuccess(res, []);
        } else {
            var placesToSendFront = [];
            data.forEach(place => {
                placesToSendFront.push(new Place(place));
            });
            return funcs.sendSuccess(res, placesToSendFront);
        }
    })
    .catch((error) => reject(error));
}

exports.createAccount = (req, res, next) => {

    const body = req.body;
    if (body.loginAccountCreated && body.prenom && body.nom && body.email && body.password && body.admin && body.promotion) {
        return funcs.sendError(res, "Il manque des informations pour créer le compte !");
    }
    //we have to chekc if nobody has the same login yet
    funcs.bddQuery(req.conBDA, "SELECT COUNT(*) FROM newUsers WHERE login LIKE ?", req.body.loginAccountCreated + '%') //retourne le nombre de compte ayant eu le meme login assigné par défaut
    .then((data) => {

        var index = data[0]['COUNT(*)'];

        if (index != 0) {
            req.body.loginAccountCreated = req.body.loginAccountCreated + String(index + 1);
        }
        // We have all info we need to create account
        const creationDate = currentDate();
        const lastConDate = currentDate();
        funcs.bddQuery(req.conBDA, 'INSERT INTO newUsers (login, prenom, nom, email, email_verified, password, admin, contributor, date_creation, date_last_con, promo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); ', [req.body.loginAccountCreated, body.prenom, body.nom, body.email, false /*email verified : no*/, body.password, body.admin, 0 /* not contributor by default*/ , creationDate, lastConDate, body.promotion])
        .then(() => {next()})
        .catch((error) => {return funcs.sendError(res, "Erreur lors de la création du compte");})
        
    })
    .catch((error) => {return funcs.sendError(res, "Erreur lors de la création du compte");})
}

exports.modifyAccount = (req, res, next) => {
    const body = req.body;
    if (body.token && body.prenom && body.nom && body.email && body.password && body.promotion) {
        return funcs.sendError(res, "Il manque des informations pour modifier le compte !");
    }
    var old_email;
    funcs.bddQuery(req.conBDA, "SELECT email FROM newUsers WHERE login = ?", [body.login])
    .then((data)=> {
        old_email = data[0].email;
        funcs.bddQuery(req.conBDA, "UPDATE newUsers SET prenom=?, nom=?, email=?, promo=?, password=? WHERE login = ?", [body.prenom, body.nom, body.email, body.promo, body.password, body.login])
        .then(()=> {
            emailOptions = {
                from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
                to: old_email, // list of receivers
                subject: "[BDA] Modification des informations du compte", // Subject line
                html : "<p> Bonjour, </p> <p> les informations de ton compte viennent d'être changées sur le portail BDA, si cela n'est pas le cas, contacte un administrateur.</p>"
            }
            funcs.sendMail(emailOptions)
            .then((result) => {
                funcs.sendSuccess(res, {message : "Modifications enregistrées"})
            })
            .catch((err) => {
                return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", err)
            })
        })
        .catch((err) => {
            
            return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", err)
        })

    })
    .catch(error => {
        return funcs.sendError(res, "Erreur, merci de contacter un administrateur !");

    })
}
   

exports.createDemandVerification = (req, res, next) => {
    let num = Math.floor(Math.random() * (1_000_000_000))
    let hash = funcs.hash(num.toString());
    let DateCreation = funcs.currentDate();

    // inscription des informations dans la base de données de récupération de mots de passe, puis création du token et envoi à la fonction suivante
    funcs.bddQuery(req.conBDA, "INSERT INTO VerificationEmail (login, code, dateDemand) VALUES (?, ?, ?)", [req.body.loginAccountCreated, hash, DateCreation])
    .then(() => {
        // Generation du WebToken
        req.body.hash = hash;
        next();
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 204 & 402)", error);});
}

exports.SendVerificationEmail  = (req, res, next) => {

    // Email for verification of address mail

    email1Options = {
        from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "[BDA] Verification adresse mail", // Subject line
        html : "<p> Bonjour, </p> <p> tu as créé un compte avec cet email sur le site du BDA des Mines Paristech, si cela n'est pas le cas, contacte les administrateurs ou répond à cet email. <br> Pour vérifier cet email, clique sur ce lien : <br> 'http://localhost:4200/register/verify-email/" + req.body.hash + " </p>"
    }

    // Email with connection IDs (login & password)

    email2Options = {
        from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "[BDA] Informations de connexion", // Subject line
        html : "<p> Bonjour, </p> <p> Tes informations de connexion sont : </p> <br> login : " + req.body.loginAccountCreated + "<br> Mot de passe : celui entré lors de la création de ton compte"
    }




    funcs.sendMail(email1Options)
    .then(() => {
        funcs.sendMail(email2Options)
        .then (() => {
            return funcs.sendSuccess(res, {message : "Utilisateur créé !", loginAssigned : req.body.loginAccountCreated});
        })
        .catch((err) => {
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

        if (data != undefined && data.length > 0) {
            loginToVerifyEmail = data[0].login;

            // On met à jour le compte correspondant
            funcs.bddQuery(req.conBDA, "UPDATE newUsers SET email_verified = 1 WHERE login = ?", [loginToVerifyEmail])
            .then(() => {

                // Enfin on détruit le code
                funcs.bddQuery(req.conBDA, 'DELETE FROM VerificationEmail WHERE code = ?', [req.body.code])
                .then(() => {return funcs.sendSuccess(res, {message : "Email accepté avec succès"});})
                .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);})
            })
            .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);})
        }
    })
    .catch((error) => {return funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error);})        
}