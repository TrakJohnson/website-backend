const SHA2 = require("sha2");

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
        console.log({errorCatched : error});
    }
    if (!res.headersSent){ 
        return res.status(400).send({message : message});
    }
}

var sendSuccess = function(res, object) {
    if (!res.headersSent){ 
        // console.log({objectOfSuccess: object});
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

module.exports = {bddQuery : bddQuery, hash : hash, sendError: sendError, sendSuccess : sendSuccess, whereIsAccount : whereIsAccount, currentDate : currentDate};
