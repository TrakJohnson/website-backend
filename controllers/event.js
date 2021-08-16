
const funcs = require('../functions/functions');
const Event = require('../models/event');


exports.getEventsTocome = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newBilletterie WHERE dateEvent > ?", [funcs.currentDate()])

    .then((data) => {
        
        if (data == undefined || data.length < 1) {
            
            funcs.sendSuccess(res, [])
        } else {
            var eventsToSendToFrond = [];
            data.forEach(eventData => {
                eventsToSendToFrond.push(new Event(eventData));
            });
            funcs.sendSuccess(res, eventsToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

exports.getAllEvents = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newBilletterie", [])
    .then((data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var eventsToSendToFrond = [];
            console.log("sent all events !");
            data.forEach(eventData => {
                eventsToSendToFrond.push(new Event(eventData));
            });
            funcs.sendSuccess(res, eventsToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

exports.createBilletterie = (req, res, next) => {
    const body = req.body;

    if (body.title && body.description && body.dateEvent && body.event_place && body.thumbnail && body.pole_id && body.loginSender && body.date_open && body.date_close && body.num_places && body.cost_contributor && body.cost_non_contributor && body.points) {
        
        funcs.bddQuery(req.conBDA, "INSERT INTO newBilletterie ('title', 'description', 'dateEvent', 'event_place', 'pole_id', 'login_creator', 'date_open', 'date_close', 'num_places', 'cost_contributor', 'const_non_contributor', 'points', 'on_sale', 'thumbnail') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [body.title , body.description , body.dateEvent , body.event_place , body.pole_id , body.loginSender , body.date_open , body.date_close , body.num_places , body.cost_contributor,  body.const_non_contributor, body.points, 0 /* Billetterie fermée lors de sa création*/, body.thumbnail])
        .then(() => funcs.sendSuccess(res, {message : "Evenement créé !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-1 & 405)", error))
    }
}

exports.modifyBilletterie = (req, res, next) => {

    // D'abord on vérifie qu'on a les infos dont on a besoin
    const body = req.body;
    if (body.event_id == undefined) {
        return funcs.sendError(res, "Pas d'ID de Billetterie fourni");
    }

    // Ensuite on récupère les infos actuelles de la Billetterie
    funcs.bddQuery(req.conBDA, "SELECT * FROM newBilletterie WHERE event_id = ?", [body.event_id])
    .then((data) => {
        if (data == undefined || data.length < 1){
            return funcs.sendError(res, "ID de Billetterie non reconnu");
        }
        var event = new Event(data);
        event.updateEventData(req);
        funcs.bddQuery(req.conBDA, "UPDATE 'newBilletterie' SET 'title'=?,'description'=?,'date'=?,'loc'=?,'pole_id'=?, 'login_creator'=?,'date_open'=?,'date_end'=?,'num_places'=?,'cost_contributor'=?,'const_non_contributor'=?','points'=?,'status'=? WHERE event_id = ?", [event.title , event.description , event.dateEvent , event.event_place , event.pole_id , event.loginSender , event.date_open , event.date_close , event.num_places , event.cost_contributor,  event.const_non_contributor, event.points, event.status, event.event_id])
        .then(() => funcs.sendSuccess(res, {message : "Evenement modifié !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-2 & 405)", error))
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-3 & 405)", error))
}

exports.deleteBilletterie = (req, res, next) => {
    // D'abord on vérifie qu'on a les infos dont on a besoin
    const body = req.body;
    if (body.event_id == undefined) {
        return funcs.sendError(res, "Pas d'ID de Billetterie fourni");
    }
    
    // Ensuite on supprime les places relatives à cet évènement
    funcs.bddQuery(req.conBDA, "DELETE FROM newPlaces WHERE event_id = ?", [body.event_id])
    .then(() => {
        // Enfin on supprime l'évènement en lui même
        funcs.bddQuery(req.conBDA, "DELETE FROM newBilletterie WHERE event_id = ?", [body.event_id])
        .then(() => funcs.sendSuccess(res, {message : "Evenement supprimé !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-4 & 405)", error))
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-4 & 405)", error))
   
}
