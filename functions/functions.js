const SHA2 = require("sha2");
const nodemailer = require('nodemailer');


// TODO: change all function expressions to function declarations

// --- SQL utils

function bddQuery(con, query, args) {
    return new Promise(function (resolve, reject) {
        con.query(query, args, function (error, rows) {  // On cherche le mot de passe associé à ce
            // login, ainsi que "admin" qui indique si le compte est admin ou non
            if (error) { // La requête a échoué
                return reject(error);
            }
            if (rows === undefined || rows?.length === 0) { // Si la requête ne renvoie rien
                return resolve([]);
            } else {   // Si la requête a renvoyé qqchose
                return resolve(rows);
            }
        });
    });
}


// --- DB utils

function hash(word) {
    return SHA2["SHA-256"](word).toString("hex");
}

// -- HTTP utils

function sendError(res, message, error = "") {
    console.log("\x1b[31m Error encountered:\x1b[0m")
    console.log(error);

    if (error == "") {
        console.log(message);
    }
    if (!res.headersSent) {
        return res.status(400).send({message: message});
    }
}

var sendSuccess = function (res, object) {
    if (!res.headersSent) {
        return res.status(200).send(object);
    }
}

var whereIsAccount = function (con, login) {
    // On cherche avec cette fonction à déterminer si un certain login est dans la base des comptes approuvés, en attente, ou si le login n'est pas présent
    var table = "";   // Table : Dans quelle table a été trouvé le login
    return new Promise(function (resolve, reject) {
        bddQuery(con, "SELECT COUNT(*) FROM Rezal_test WHERE login = ?", [login])
            .then((num) => {
                if (num[0]['COUNT(*)'] === 1) { // Trouvé
                    table = "Rezal_test";
                    return resolve(table);
                } else {   // Pas trouvé dans la base des comptes approuvés, on cherche dans l'autre
                    bddQuery(con, "SELECT COUNT(*) FROM Rezal_attente WHERE login = ?", [login])
                        .then((num) => {
                            if (num[0]['COUNT(*)'] === 1) { // Trouvé
                                table = "Rezal_attente";
                                return resolve(table);
                            } else {    // Dans aucune des deux
                                return resolve(table);
                            }
                        })
                        .catch((error) => {
                            return reject(error);
                        });
                }
            })
            .catch((error) => {
                return reject(error);
            });
    });
};


var currentDate = function () {
    var date = new Date();
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');

}


var oneYAgoDate = function () {
    var date = new Date()
    date.setFullYear(date.getFullYear() - 1);
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}


var sendMail = function (mailOptions) {
    mailOptions["to"] = process.env["TEST_MAIL_RECEIVER"] //TODO: remove this line, this is to only send mails to myself
    const transport = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env["MAIL_SENDER"], //'bda.rsi.minesparis@gmail.com',
            pass: process.env['GMAIL_PASS']
        }
    });

    return transport.sendMail(mailOptions);/*, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId)});*/
}


var openBilletterie = function (event_id, con) {
    bddQuery(con, "UPDATE newEvents SET on_sale = 1 WHERE event_id = ?", [event_id])
        .then(() => {
            console.log("Billetterie en vente id : " + event_id)
            return resolve()
        })
        .catch((error) => {
            return reject(error)
        })
}

var closeBilletterie = function (event_id, con) {
    bddQuery(con, "UPDATE newEvents SET on_sale = 0 WHERE event_id = ?", [event_id])
        .then(() => {
            console.log("Billetterie en vente id : " + event_id)
            return resolve()
        })
        .catch((error) => {
            return reject(error)
        })
}


module.exports = {
    openBilletterie: openBilletterie,
    closeBilletterie: closeBilletterie,
    oneYAgoDate: oneYAgoDate,
    sendMail: sendMail,
    bddQuery: bddQuery,
    hash: hash,
    sendError: sendError,
    sendSuccess: sendSuccess,
    whereIsAccount: whereIsAccount,
    currentDate: currentDate
};




