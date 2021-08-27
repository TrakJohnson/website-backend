
const funcs = require('../functions/functions');
const Pole = require('../models/pole');

exports.getPoles = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newPoles")
    .then(async (data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var polesToSendToFrond = [];
            const getData = async () => {
                for (var i = 0; i < data.length; i++) {
                    var poleData = data[i];
                    poleData.members = await funcs.bddQuery(req.conBDA, "SELECT * FROM newMembers WHERE pole_id = ?", [poleData.pole_id]);
                    polesToSendToFrond.push(new Pole(poleData));
                }
            }
            await getData();
            funcs.sendSuccess(res, polesToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}