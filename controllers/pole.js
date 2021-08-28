
const funcs = require('../functions/functions');
const Member = require('../models/member');
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
                    poleData.members = await funcs.bddQuery(req.conBDA, "SELECT * FROM newMembers JOIN newUsers ON newMembers.login = newUsers.login WHERE pole_id = ?", [poleData.pole_id]);
                    for (var j = 0; j < poleData.members.length; j++) {
                        poleData.members[j] = new Member(poleData.members[j]);
                        console.log({member : poleData.members[j] });
                    }
                    console.log({pole: new Pole(poleData)});
                    polesToSendToFrond.push(new Pole(poleData));
                }j
            }
            await getData();
            funcs.sendSuccess(res, polesToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}