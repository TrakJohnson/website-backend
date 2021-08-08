
const funcs = require('../functions/functions');
const Event = require('../models/event');

exports.getEventsTocome = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newBilleterie WHERE date > ", [funcs.currentDate()])
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
    funcs.bddQuery(req.conBDA, "SELECT * FROM newBilleterie", [])
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

exports.createBilletterie = (req, res, next) => {
    const body = req.body;
    if (body.title && body.description && body.dateEvent && body.event_place && body.id_pole && body.loginSender && body.date_open && body.date_close && body.num_places && body.cost_contributor && body.const_non_contributor && body.points) {
        funcs.bddQuery(req.conBDA, "INSERT INTO newBilleterie ('title', 'description', 'date', 'loc', 'pole_id', 'login_creator', 'date_open', 'date_end', 'num_places', 'cost_contributor', 'const_non_contributor', 'points', 'status') VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [body.title , body.description , body.dateEvent , body.event_place , body.id_pole , body.loginSender , body.date_open , body.date_close , body.num_places , body.cost_contributor,  body.const_non_contributor, body.points, 0 /* billeterie fermée lors de sa création*/])
        .then(() => funcs.sendSuccess(res, {message : "Evenement créé !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-1 & 405)", error))
    }
}

exports.modifyBilletterie = (req, res, next) => {

    // D'abord on vérifie qu'on a les infos dont on a besoin
    const body = req.body;
    if (body.id_event == undefined) {
        return funcs.sendError(res, "Pas d'ID de billeterie fourni");
    }

    // Ensuite on récupère les infos actuelles de la billeterie
    funcs.bddQuery(req.conBDA, "SELECT * FROM newBilleterie WHERE id_event = ?", [body.id_event])
    .then((data) => {
        if (data == undefined || data.length < 1){
            return funcs.sendError(res, "ID de billeterie non reconnu");
        }
        var event = new Event(data);
        event.updateEventData(req);
        funcs.bddQuery(req.conBDA, "UPDATE 'newBilleterie' SET 'title'=?,'description'=?,'date'=?,'loc'=?,'pole_id'=?, 'login_creator'=?,'date_open'=?,'date_end'=?,'num_places'=?,'cost_contributor'=?,'const_non_contributor'=?','points'=?,'status'=? WHERE id_event = ?", [event.title , event.description , event.dateEvent , event.event_place , event.id_pole , event.loginSender , event.date_open , event.date_close , event.num_places , event.cost_contributor,  event.const_non_contributor, event.points, event.status, event.id_event])
        .then(() => funcs.sendSuccess(res, {message : "Evenement modifié !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-2 & 405)", error))
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-3 & 405)", error))
}

exports.deleteBilletterie = (req, res, next) => {
    // D'abord on vérifie qu'on a les infos dont on a besoin
    const body = req.body;
    if (body.id_event == undefined) {
        return funcs.sendError(res, "Pas d'ID de billeterie fourni");
    }
    
    // Ensuite on supprime les places relatives à cet évènement
    funcs.bddQuery(req.conBDA, "DELETE FROM newPlaces WHERE id_event = ?", [body.id_event])
    .then(() => {
        // Enfin on supprime l'évènement en lui même
        funcs.bddQuery(req.conBDA, "DELETE FROM newBilleterie WHERE id_event = ?", [body.id_event])
        .then(() => funcs.sendSuccess(res, {message : "Evenement supprimé !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-4 & 405)", error))
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-4 & 405)", error))
   
}