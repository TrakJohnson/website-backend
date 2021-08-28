

var Place = class Place {
    constructor(data) {
        this.place_id = data.place_id;
        this.event_id = data.event_id;
        this.login = data.login;
        this.status = data.status;
        this.payed = data.payed;
        this.points = data.points;
        this.contributor = data.contributor;
    }  

    updateEventData(newInfos) {
        this.place_id = newInfos.place_id != undefined ? newInfos.place_id : this.place_id;
        this.event_id = newInfos.event_id != undefined ? newInfos.event_id : this.event_id;
        this.login = newInfos.login != undefined ? newInfos.login : this.login;
        this.status = newInfos.status != undefined ? newInfos.status : this.status;
        this.payed = newInfos.payed != undefined ? newInfos.payed : this.payed;
        this.points = newInfos.points != undefined ? newInfos.points : this.points;
        this.contributor = newInfos.contributor != undefined ? newInfos.contributor : this.contributor;
    }
}

module.exports = Place;