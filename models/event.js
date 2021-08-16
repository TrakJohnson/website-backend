

var Event = class Event {
    constructor(data) {
        this.event_id = data.event_id;
        this.title = data.title;
        this.description = data.description;
        this.dateEvent = data.dateEvent;
        this.thumbnail = data.thumbnail;
        this.event_place = data.event_place;
        this.pole_id = data.pole_id;
        this.login_creator = data.loginSender;
        this.date_open = data.date_open;
        this.date_close = data.date_close;
        this.num_places = data.num_places;
        this.cost_contributor = data.cost_contributor;
        this.const_non_contributor = data.const_non_contributor;
        this.points = data.points;
        this.on_sale = data.on_sale || 0;
    }  

    static updateEventData(newInfos) {
        this.event_id = newInfos.event_id != undefined ? newInfos.event_id : this.event_id;
        this.title = newInfos.title != undefined ? newInfos.title : this.titled;
        this.description = newInfos.description != undefined ? newInfos.description : this.description;
        this.dateEvent = newInfos.dateEvent != undefined ? newInfos.dateEvent : this.dateEvent;
        this.event_place = newInfos.event_place != undefined ? newInfos.event_place : this.event_place;
        this.thumbnail = newInfos.thumbnail != undefined ? newInfos.thumbnail : this.thumbnail;
        this.pole_id = newInfos.pole_id != undefined ? newInfos.pole_id : this.pole_id;
        this.login_creator = newInfos.login_creator != undefined ? newInfos.login_creator : this.login_creator;
        this.date_open = newInfos.date_open != undefined ? newInfos.date_open : this.id_evedate_opennt;
        this.date_close = newInfos.date_close != undefined ? newInfos.date_close : this.date_close;
        this.num_places = newInfos.num_places != undefined ? newInfos.num_places : this.num_places;
        this.cost_contributor = newInfos.cost_contributor != undefined ? newInfos.cost_contributor : this.cost_contributor;
        this.const_non_contributor = newInfos.const_non_contributor != undefined ? newInfos.const_non_contributor : this.const_non_contributor;
        this.points = newInfos.points != undefined ? newInfos.points : this.points;
        this.on_sale = newInfos.on_sale != undefined ? newInfos.on_sale : this.on_sale;
    }
}

module.exports = Event;