const funcs = require('./functions/functions');
//import * as CryptoJS from 'crypto-js';
const CryptoJS = require('crypto-js');

function createPassword() {
    const pwdChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const pwdLen = 10;
    return Array(pwdLen).fill(pwdChars).map(function (x) {
      return x[Math.floor(Math.random() * x.length)]
    }).join('')
  }

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createNewPromoUsers(promo, conPortail, conBDA){
    console.log("alde")
    res = {}
    funcs.bddQuery(conPortail, "SELECT * FROM portail.auth_user WHERE username like '"+promo+"%'")
        .then(async (data) => {
            if (data.length === 0) {
                return funcs.sendError(res, "L'identifiant du portail n'existe pas. " +
                    "Si vous n'avez pas de compte sur le portail, merci d'utiliser l'inscription classique.")
            } else{
                let mailTransporter = funcs.getTransporterPool();
                for (let line of data){
                    console.log(line)
                    funcs.bddQuery(conBDA, "SELECT COUNT(*) FROM newUsers WHERE login LIKE ?", line.username + '%') //retourne le nombre de compte ayant eu le meme login assigné par défaut
                    .then(async (data) => {
                        let index = data[0]['COUNT(*)'];
                        if (index > 0) {
                            funcs.sendError(res, "Erreur, ce compte existe déjà ! Merci de récupérer votre mot de passe, ou de contacter un administrateur.")
                            return;
                        }
                        
                        
                        const creationDate = funcs.currentDate();
                        const lastConDate = funcs.currentDate();
                        let id = line.username;
                        let promo = id[0] === 'i' ? 'ISUP' + id.slice(1, 3) : 'P' + id.slice(0, 2);
                        let password = createPassword();
                        
                        let password_encr = CryptoJS.SHA3(password, {outputLength: 512}).toString(CryptoJS.enc.Hex);
                        
                        let emailOptions = {
                            from: '"Site BDA" <bda.rsi.minesparis@gmail.com>', // sender address
                            to: line.email, // list of receivers
                            subject: "[Site BDA] Création du compte", // Subject line
                            html : "<p> Bonjour, </p> <p> Voici tes identifiants pour le site du bda: </p><p>Login:"+ line.username+"</p><p>Mdp: "+password+"</p> <p>Je t'encourage vivement a changer ton mdp en te connectant sur le <a href='https://bda-minesparis.fr'>site</a> ! </p>"
                        }
                        funcs.sendMailPool(mailTransporter, emailOptions).then(()=> {
                            console.log("Mail envoyé")
                            }).catch((error)=>{
                                console.log("hein "+error)
                            });
                        
                        funcs.bddQuery(
                            conBDA, 'INSERT INTO newUsers (login,login_portail, prenom, nom, email, email_verified,email_mines, password, admin, contributor, date_creation, date_last_con, promo,points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,0); ',
                            [line.username,line.username, line.first_name, line.last_name, line.email, true,line.email, password_encr, false, 0 , creationDate, lastConDate, promo]
                        )
                            .then(() => {console.log("success");})
                            .catch((err) => { console.log(err);funcs.sendError(res, "Erreur lors de la création du compte") })
                    })
                    .catch((err) => funcs.sendError(res, "Erreur lors de la création du compte"))
                //return; //we process a single one
                //await sleep(200);
                }
                await sleep(5*60*1000);
                mailTransporter.close();
            }
        })
        .catch((err) => funcs.sendError(res, "Erreur dans la vérification du portail"))  // TODO: return funcs sendError
}



exports.createNewPromoUsers = async function (promo, conPortail,conBDA, safety){
    if(!safety){ //Just here so that I dont accidently run the code 
        return
    }
    await sleep(3000); //wait for the connexions to be established
    createNewPromoUsers(promo, conPortail, conBDA);
};