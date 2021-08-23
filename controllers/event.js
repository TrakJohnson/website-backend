
const funcs = require('../functions/functions');
const Event = require('../models/event');


exports.getEventsTocome = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE dateEvent > ?", [funcs.currentDate()])

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
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents", [])
    .then((data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var eventsToSendToFrond = [];
            console.log("sent all events !");
            data.forEach(eventData => {
                const event = new Event(eventData)
                console.log({eventName : event.title, data : event.dateEvent});
                eventsToSendToFrond.push(new Event(eventData));
            });
            funcs.sendSuccess(res, eventsToSendToFrond);
        }
    }) 
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

exports.getOneEvent = (req, res, next) =>{
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE event_id = ?", [req.body.id])
    .then((data) => {
        if (data == undefined || data.length <1) {
            funcs.sendError(res, "Pas de billetterie avec cet id", data)
        }
        else {
            funcs.sendSuccess(res, data[0])
        }
    })
    .catch((error)=>{
        funcs.sendError(res, "Erreur, merci de contacter un administrateur", error)
    })

}

exports.createEvent = (req, res, next) => {
    const body = req.body;

    if (body.title && body.description && body.dateEvent && body.event_place && body.thumbnail && body.pole_id && body.loginSender && body.date_open && body.date_close && body.num_places && body.cost_contributor && body.cost_non_contributor && body.points && body.is_billetterie) {
        
        funcs.bddQuery(req.conBDA, "INSERT INTO `newEvents` (`event_id`, `title`, `description`, `dateEvent`, `event_place`, `pole_id`, `login_creator`, `date_open`, `date_close`, `num_places`, `cost_contributor`, `cost_non_contributor`, `points`, `on_sale`, `thumbnail`, `is_billetterie`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [body.title , body.description , body.dateEvent , body.event_place , body.pole_id , body.loginSender , body.date_open , body.date_close , body.num_places , body.cost_contributor,  body.cost_non_contributor, body.points, 0 /* Event fermée lors de sa création*/, body.thumbnail, body.is_billetterie])
        .then(() => funcs.sendSuccess(res, {message : "Evenement créé !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-1 & 405)", error))
    }
}

exports.modifyEvent = (req, res, next) => {
    
    // D'abord on vérifie qu'on a les infos dont on a besoin
    const body = req.body;
    console.log(body.sendMail)
    
    var mail_list = []

    if (body.event_id == undefined) {
        return funcs.sendError(res, "Pas d'ID de Event fourni");
    }

    // Ensuite on récupère les infos actuelles de la Event
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE event_id = ?", [body.event_id])
    .then((data) => {
        if (data == undefined || data.length < 1){
            return funcs.sendError(res, "ID de Event non reconnu");
        }

        if (body.sendMail) {

            funcs.bddQuery(req.conBDA, "SELECT newUsers.email FROM newUsers JOIN newPlaces ON newUsers.login = newPlaces.login WHERE newPlaces.event_id = ?", [req.body.event_id])
            .then((data)=> {
                if (data != undefined && data.length > 0) {
                    data.forEach(user => {
                        mail_list.push(user.email);
                    });
                }
                funcs.bddQuery(req.conBDA, "SELECT newUsers.email FROM newUsers JOIN newEvents ON newUsers.login = newEvents.login_creator WHERE newEvents.event_id = ?", [req.body.event_id])
                .then((data) => {

                    if (data != undefined && data.length > 0) {
                        mail_list.push(data[0].email);
                    }

                    emails = mail_list.toString();
                    
                    emailOptions = {
                        from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
                        to: emails, // list of receivers
                        subject: "[BDA] Modification d'une de vos billetteries", // Subject line
                        html : "<p> Bonjour, </p> <p> Une billetterie te concernant vient d'être modifiée, n'hésite pas à consulter le <a href = 'http://localhost:4200'> portail BDA </a> pour plus d'informations. (code modification :" + body.event_id + ")."
                    }

                    funcs.sendMail(emailOptions);

                    var event = new Event(data);
                    event.updateEventData(body);
                    funcs.bddQuery(req.conBDA, "UPDATE newEvents SET title=?, description=?, dateEvent=?, event_place=?, pole_id=?, date_open=?, date_close=?, num_places=?, cost_contributor=?, cost_non_contributor=?, points=?, on_sale = ?, thumbnail = ?, is_billetterie = ?  WHERE event_id = ?", [event.title , event.description , event.dateEvent , event.event_place , event.pole_id, event.date_open , event.date_close , event.num_places , event.cost_contributor,  event.cost_non_contributor, event.points, event.on_sale, body.thumbnail, body.is_billetterie,  event.event_id])
                    .then(() => funcs.sendSuccess(res, {message : "Evenement modifié !"}))
                    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-2 & 405)", error))
                })
                .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error))
            })
            .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error))

        }
        else {
            var event = new Event(data);
            event.updateEventData(body);
            funcs.bddQuery(req.conBDA, "UPDATE newEvents SET title=?, description=?, dateEvent=?, event_place=?, pole_id=?, date_open=?, date_close=?, num_places=?, cost_contributor=?, cost_non_contributor=?, points=?, on_sale = ?, thumbnail = ?, is_billetterie = ?  WHERE event_id = ?", [event.title , event.description , event.dateEvent , event.event_place , event.pole_id, event.date_open , event.date_close , event.num_places , event.cost_contributor,  event.cost_non_contributor, event.points, event.on_sale, body.thumbnail, body.is_billetterie, event.event_id])
            .then(() => funcs.sendSuccess(res, {message : "Evenement modifié !"}))
            .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-2 & 405)", error))
        }

        
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-3 & 405)", error))
}

exports.deleteEvent = (req, res, next) => {
    // D'abord on vérifie qu'on a les infos dont on a besoin
    const body = req.body;

    var mail_list = []

    if (body.event_id == undefined) {
        return funcs.sendError(res, "Pas d'ID de Event fourni");
    }
    //on récupère le mail des personnes ayant pris cette billetterie
    funcs.bddQuery(req.conBDA, "SELECT newUsers.email FROM newUsers JOIN newPlaces ON newUsers.login = newPlaces.login WHERE newPlaces.event_id = ?", [req.body.event_id])
    .then((data)=> {

        data.forEach(user => {
            mail_list.push(user.email)
        });

        //on récupère également le mail du créateur
        funcs.bddQuery(req.conBDA, "SELECT newUsers.email FROM newUsers JOIN newEvents ON newUsers.login = newEvents.login_creator WHERE newEvents.event_id = ?", [req.body.event_id])
        .then((data) => {

            mail_list.push(data[0].email)
            
            emails = mail_list.toString()
            console.log(mails)
            // Ensuite on supprime les places relatives à cet évènement
            funcs.bddQuery(req.conBDA, "DELETE FROM newPlaces WHERE event_id = ?", [body.event_id])
            .then(() => {
                // Enfin on supprime l'évènement en lui même
                funcs.bddQuery(req.conBDA, "DELETE FROM newEvents WHERE event_id = ?", [body.event_id])
                .then(() => {

                    emailOptions = {
                        from: '"RSI BDA" <bda.rsi.minesparis@gmail.com>', // sender address
                        to: emails, // list of receivers
                        subject: "[BDA] Suppression d'une de vos billetteries", // Subject line
                        html : "<p> Bonjour, </p> <p> Une billetterie te concernant vient d'être supprimé, n'hésite pas à consulter le <a href = 'http://localhost:4200'> portail BDA </a> pour plus d'informations. (code suppression :" + body.event_id + ")."
                    }
                    console.log("Event supprimée, id :" + event_id)
                    
                    funcs.sendSuccess(res, {message : "Evenement supprimé !"})
                    
                    
                })
                .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-4 & 405)", error))
            })
            .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-4 & 405)", error))

        })
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error))

    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error))
};
