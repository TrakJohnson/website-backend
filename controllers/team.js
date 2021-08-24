const funcs = require('../functions/functions');
const Member = require('./../models/member');




exports.getMembers = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newMembers JOIN newUsers ON newMembers.login = newUsers.login ")
    .then((data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            console.log(data)
            funcs.sendSuccess(res, data);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

