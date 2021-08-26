const SHA2 = require("sha2");


const {google} = require('googleapis');
const nodemailer = require('nodemailer');

var bddQuery = function(con, query, args) {
    return new Promise(function(resolve, reject) {
        con.query(query , args, function(error,rows) {  // On cherche le mot de passe associé à ce 
            // login, ainsi que "admin" qui indique si le compte est admin ou non
            if(error) { // La requête a échoué
                return reject(error);
            }
            if (rows == undefined || rows?.length == 0) { // Si la requête ne renvoie rien
                return resolve([]);
            } else {   // Si la requête a renvoyé qqchose
                return resolve(rows);
            }
        });
    });
};

var hash = function(word) {
    return SHA2["SHA-256"](word).toString("hex");
}

var sendError = function(res, message, error = "") {
    if (error != "") {
    }
    if (!res.headersSent){ 
        return res.status(400).send({message : message});
    }
}

var sendSuccess = function(res, object) {
    if (!res.headersSent){ 
        return res.status(200).send(object);
    }
}

var whereIsAccount = function(con, login) {

    // On cherche avec cette fonction à déterminer si un certain login est dans la base des comptes approuvés, en attente, ou si le login n'est pas présent
    var table = "";   // Table : Dans quelle table a été trouvé le login
    return new Promise(function(resolve, reject) {
        bddQuery(con, "SELECT COUNT(*) FROM Rezal_test WHERE login = ?", [login]) 
        .then((num) => {
            if (num[0]['COUNT(*)'] == 1) { // Trouvé
                table = "Rezal_test";
                return resolve(table);
            } else {   // Pas trouvé dans la base des comptes approuvés, on cherche dans l'autre
                bddQuery(con, "SELECT COUNT(*) FROM Rezal_attente WHERE login = ?", [login])
                .then((num) => {
                    if (num[0]['COUNT(*)'] == 1) { // Trouvé
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


var currentDate = function() {
    var date = new Date(); 
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();

}

var oneYAgoDate = function() {
    var date = new Date()
    date.setFullYear( date.getFullYear() - 1 );
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
}





const CLIENT_ID = '835286550118-pbprqfpea429517nv00gr3cnjalesgg6.apps.googleusercontent.com'
const CLIENT_SECRET = '8zBFpPxdyzaUiO0_CBTJA-WM'
const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = '1//04n-bNw5d9m8aCgYIARAAGAQSNwF-L9IrKSZYJJ-cmxz-lesPTFlyVdQeutlV48Bhx4GIBzyVyE3DR8OP6W4LZ6mVaPYyT_V1PIk'


const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
oAuth2Client.setCredentials({refresh_token : REFRESH_TOKEN})

var sendMail = function(mailOptions) {
 
    try {
    const accessToken = oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        type: 'OAuth2',
        user: 'bda.rsi.minesparis@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
        },
    });

    const result = transport.sendMail(mailOptions);
   
    return result;
    } catch (error) { 
    }
}




module.exports = {oneYAgoDate : oneYAgoDate, sendMail : sendMail, bddQuery : bddQuery, hash : hash, sendError: sendError, sendSuccess : sendSuccess, whereIsAccount : whereIsAccount, currentDate : currentDate};




