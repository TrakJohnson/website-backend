const { sendSuccess } = require('../functions/functions');
const funcs = require('../functions/functions');

exports.sendMail = (req, res, next) => {

    const body = req.body;
    

    emailOptions = {
        from: '"Message du site" <bda.rsi.minesparis@gmail.com>', // sender address
        to: "bda.rsi.minesparis@gmail.com", // list of receivers
        subject: "[Portail BDA] " + body.sujet, // Subject line
        html : "<p> Bonjour, </p> <p> Un message vient d'être envoyé depuis l'onglet contact du site par " + body.nom + " en utilisant son adresse mail " + body.email + " concernant le sujet : " + body.sujet + ". Voici le message : </p> <br> <p> " + body.contenu + " </p>"
    }
    funcs.sendMail(emailOptions)
    .then(()=> {
        funcs.sendSuccess(res, {message : "Message envoyé"})
        
    })
    .catch((error) => {
        funcs.sendError(res, "Le message n'a pas pu être envoyé, merci de contacter un administrateur par un autre moyen", error)
    })

}