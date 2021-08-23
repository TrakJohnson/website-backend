const funcs = require('../functions/functions');
const Member = require('./../models/member');

exports.getMembers = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newMembers")
    .then((data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var membersToSendToFront = [];
            data.forEach(memberData => {
                const other_data = funcs.bddQuery(req.conBDA, "SELECT * FROM newUsers WHERE login = ?", [memberData.login]);
                var member = new Member(memberData);
                member.updateMemberData(other_data);
                membersToSendToFront.push(member);
            });
            funcs.sendSuccess(res, membersToSendToFront);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

