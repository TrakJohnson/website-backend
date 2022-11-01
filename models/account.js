var Account = class Account {
    constructor(data) {
        console.log(data)
        /* Les données de data proviennent directement de la requête SQL */
        this.prenom = data.prenom;
        this.nom = data.nom;
        this.login = data.login;
        this.login_portail = data.login_portail;
        this.email = data.email_mines ? data.email_mines : data.email;
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

    static updateAccountData(newInfos) {
        console.log(this.login + " data update")
        this.prenom = newInfos.prenom !== undefined ? newInfos.prenom : this.prenom;
        this.nom = newInfos.nom !== undefined ? newInfos.nom : this.nom;
        this.login = newInfos.login !== undefined ? newInfos.login : this.login;
        this.email = newInfos.email !== undefined ? newInfos.email : this.email;
        this.email_verified = newInfos.email_verified !== undefined ? newInfos.email_verified : this.email_verified;
        this.contributor = newInfos.contributor !== undefined ? newInfos.contributor : this.contributor;
        this.admin = newInfos.admin !== undefined ? newInfos.admin : this.admin;
        this.points = newInfos.points !== undefined ? newInfos.points : this.points;
        this.date_creation = newInfos.date_creation !== undefined ? newInfos.date_creation : this.date_creation;
        this.date_last_con = newInfos.date_last_con !== undefined ? newInfos.date_last_con : this.date_last_con;
        this.promo = newInfos.promo !== undefined ? newInfos.promo : this.promo;
        this.placesClaimed = newInfos.placesClaimed !== undefined ? newInfos.placesClaimed : this.placesClaimed;
        this.last_token = newInfos.last_token !== undefined ? newInfos.last_token : this.last_token;
    }
}

module.exports = Account;