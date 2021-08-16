

var Pole = class Pole {
    constructor(data) {
        this.pole_id = data.pole_id;
        this.name = data.name;
        this.description = data.description;
        this.members = data.members;
    }  

    static updatePoleData(newInfos) {
        this.pole_id = newInfos.pole_id != undefined ? newInfos.pole_id : this.pole_id;
        this.name = newInfos.name != undefined ? newInfos.name : this.name;
        this.description = newInfos.description != undefined ? newInfos.description : this.description;
        this.members = newInfos.members != undefined ? newInfos.members : this.members;
    }
}

module.exports = Pole;