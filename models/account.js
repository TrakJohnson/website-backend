

var Account = class Account {
    constructor(data) {
        this.id = data.id || undefined;
        this.prenom = data.prenom || undefined;
        this.nom = data.nom || undefined;
        this.login = data.login || undefined;
        this.email = data.email || undefined;
        this.emailVerified = data.emailVerified || undefined;
        this.contributor = data.contributor || undefined;
        this.admin = data.admin || undefined;
        this.points = data.points || false;
        this.dateCreation = data.dateCreation || undefined;
        this.dateLastCon = data.dateLastCon || undefined;
        this.promo = data.promo || undefined;
    }  

    static updateAccounttData(newInfos) {
        this.id = newInfos.id != undefined ? newInfos.id : this.id;
        this.prenom = newInfos.prenom != undefined ? newInfos.prenom : this.prenom;
        this.nom = newInfos.nom != undefined ? newInfos.nom : this.nom;
        this.login = newInfos.login != undefined ? newInfos.login : this.login;
        this.email = newInfos.emai != undefinedl ? newInfos.email : this.email;
        this.emailVerified = newInfos.emailVerified != undefined ? newInfos.emailVerified : this.emailVerified;
        this.contributor = newInfos.contributor != undefined ? newInfos.contributor : this.contributor;
        this.admin = newInfos.admin != undefined ? newInfos.admin : this.admin;
        this.points = newInfos.points != undefined ? newInfos.points : this.points;
        this.dateCreation = newInfos.dateCreation != undefined ? newInfos.dateCreation : this.dateCreation;
        this.dateLastCon = newInfos.dateLastCon != undefined ? newInfos.dateLastCon : this.dateLastCon;
        this.promo = newInfos.promo != undefined ? newInfos.promo : this.promo;

    }
}

module.exports = Account;