const funcs = require('../functions/functions');
const Member = require('./../models/member');

exports.getMembers = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newMembers")
    .then(async (data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var membersToSendToFrond = [];
            await data.forEach(async memberData => {
                const other_data = await funcs.bddQuery(req.conBDA, "SELECT * FROM newUsers WHERE login = ?", [memberData.login]);
                var member = new Member(memberData);
                member.updateMemberData(other_data);
                membersToSendToFrond.push(member);
            });
            funcs.sendSuccess(res, membersToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}
