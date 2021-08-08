

var Event = class Event {
    constructor(data) {
        this.id_event = data.id_event;
        this.title = data.title;
        this.description = data.description;
        this.dateEvent = data.dateEvent;
        this.event_place = data.event_place;
        this.id_pole = data.id_pole;
        this.login_creator = data.loginSender;
        this.date_open = data.date_open;
        this.date_close = data.date_close;
        this.num_places = data.num_places;
        this.cost_contributor = data.cost_contributor;
        this.const_non_contributor = data.const_non_contributor;
        this.points = data.points;
        this.status = data.status || 0;
    }  

    static updateEventData(newInfos) {
        this.id_event = newInfos.id_event != undefined ? newInfos.id_event : this.id_event;
        this.title = newInfos.title != undefined ? newInfos.title : this.titled;
        this.description = newInfos.description != undefined ? newInfos.description : this.description;
        this.dateEvent = newInfos.dateEvent != undefined ? newInfos.dateEvent : this.dateEvent;
        this.event_place = newInfos.event_place != undefined ? newInfos.event_place : this.event_place;
        this.id_pole = newInfos.id_pole != undefined ? newInfos.id_pole : this.id_pole;
        this.login_creator = newInfos.login_creator != undefined ? newInfos.login_creator : this.login_creator;
        this.date_open = newInfos.date_open != undefined ? newInfos.date_open : this.id_evedate_opennt;
        this.date_close = newInfos.date_close != undefined ? newInfos.date_close : this.date_close;
        this.num_places = newInfos.num_places != undefined ? newInfos.num_places : this.num_places;
        this.cost_contributor = newInfos.cost_contributor != undefined ? newInfos.cost_contributor : this.cost_contributor;
        this.const_non_contributor = newInfos.const_non_contributor != undefined ? newInfos.const_non_contributor : this.const_non_contributor;
        this.points = newInfos.points != undefined ? newInfos.points : this.points;
        this.status = newInfos.status != undefined ? newInfos.status : this.status;
    }
}

module.exports = Event;