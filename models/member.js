var Member = class Member {
    constructor(data) {
        this.prenom = data.prenom;
        this.nom = data.nom;
        this.login = data.login;
        this.pole_id = data.pole_id;
        this.role = data.role;
        this.promo = data.promo;
        this.description = data.description;
    }  

    updateMemberData(newInfos) {
        this.prenom = newInfos.prenom != undefined ? newInfos.prenom : this.prenom;
        this.nom = newInfos.nom != undefined ? newInfos.nom : this.nom;
        this.login = newInfos.login != undefined ? newInfos.login : this.login;
        this.pole_id = newInfos.pole_id != undefined ? newInfos.pole_id : this.pole_id;
        this.role = newInfos.role != undefined ? newInfos.role : this.role;
        this.promo = newInfos.promo != undefined ? newInfos.promo : this.promo;
        this.description = newInfos.description != undefined ? newInfos.description : this.description;
    }
}

module.exports = Member;