

var Account = class Account {
    constructor(data) {
        this.prenom = data.prenom;
        this.nom = data.nom;
        this.login = data.login;
        this.email = data.email;
        this.email_verified = data.email_verified;
        this.contributor = data.contributor;
        this.admin = data.admin;
        this.points = data.points;
        this.date_creation = data.date_creation;
        this.date_last_con = data.date_last_con;
        this.promo = data.promo;
        this.placesClaimed = data.placesClaimed;
        this.last_token = data.last_token
    }  

    static updateAccountData(oldAccount, newInfos) {
        var newAccount = new Account({});
        newAccount.prenom = newInfos.prenom ? newInfos.prenom : oldAccount.prenom;
        newAccount.nom = newInfos.nom ? newInfos.nom : oldAccount.nom;
        newAccount.login = newInfos.login ? newInfos.login : oldAccount.login;
        newAccount.email = newInfos.emai ? newInfos.email : oldAccount.email;
        newAccount.email_verified = newInfos.email_verified ? newInfos.email_verified : oldAccount.email_verified;
        newAccount.contributor = newInfos.contributor ? newInfos.contributor : oldAccount.contributor;
        newAccount.admin = newInfos.admin ? newInfos.admin : oldAccount.admin;
        newAccount.points = newInfos.points ? newInfos.points : oldAccount.points;
        newAccount.date_creation = newInfos.date_creation ? newInfos.date_creation : oldAccount.date_creation;
        newAccount.date_last_con = newInfos.date_last_con ? newInfos.date_last_con : oldAccount.date_last_con;
        newAccount.promo = newInfos.promo ? newInfos.promo : oldAccount.promo;
        newAccount.placesClaimed = newInfos.placesClaimed ? newInfos.placesClaimed : oldAccount.placesClaimed;
        newAccount.last_token = newInfos.last_token ? newInfos.last_token : oldAccount.last_token;
        return newAccount;
    }
}

module.exports = Account;