
const funcs = require('../functions/functions');
const Pole = require('../models/pole');

exports.getPoles = (req, res, next) => {
    console.log("lala");
    funcs.bddQuery(req.conBDA, "SELECT * FROM newPoles")
    .then((data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var polesToSendToFrond = [];
            data.forEach(poleData => {
                polesToSendToFrond.push(new Pole(poleData));
            });
            console.log({poles : polesToSendToFrond});
            funcs.sendSuccess(res, polesToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}