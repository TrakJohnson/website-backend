
const funcs = require('../functions/functions');
const Event = require('../models/event');


exports.getOneEvent = (req, res, next) =>{
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE event_id = ?", [req.body.id])
    .then((data) => {
        if (data == undefined || data.length <1) {
            funcs.sendError(res, "Pas d'évènement avec cet id", data)
        }
        else {
            funcs.sendSuccess(res, data[0])
        }
    })
    .catch((error)=>{
        funcs.sendError(res, "Erreur, merci de contacter un administrateur", error)
    })

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
                eventsToSendToFrond.push(new Event(eventData));
            });
            funcs.sendSuccess(res, eventsToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

exports.getEventsTocome = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE dateEvent > ?", [funcs.currentDate()])

    .then((data) => {
        
        if (data == undefined || data.length < 1) {
            
            funcs.sendSuccess(res, [])
        } else {
            var eventsToSendToFrond = [];
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

exports.createEvent = (req, res, next) => {
    const body = req.body;

    if (body.title && body.description && body.dateEvent && body.event_place && body.thumbnail && body.pole_id && body.creator && body.date_open && body.date_close && body.num_places && body.cost_contributor && body.cost_non_contributor && body.points && body.is_billetterie) {
        
        funcs.bddQuery(req.conBDA, "INSERT INTO `newEvents` (`event_id`, `title`, `description`, `dateEvent`, `event_place`, `pole_id`, `login_creator`, `date_open`, `date_close`, `num_places`, `cost_contributor`, `cost_non_contributor`, `points`, `on_sale`, `thumbnail`, `is_billetterie) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [body.title , body.description , body.dateEvent , body.event_place , body.pole_id , body.creator , body.date_open , body.date_close , body.num_places , body.cost_contributor,  body.cost_non_contributor, body.points, 0 /* Billetterie fermée lors de sa création*/, body.thumbnail, 1])
        .then(() => funcs.sendSuccess(res, {message : "Evenement créé !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-1 & 405)", error))
    }
}

exports.modifyBilletterie = (req, res, next) => {
    
    // D'abord on vérifie qu'on a les infos dont on a besoin
    const body = req.body;
    console.log(body.sendMail)
    
    var mail_list = []

    if (body.event_id == undefined) {
        return funcs.sendError(res, "Pas d'ID de Event fourni");
    }

    // Ensuite on récupère les infos actuelles de la Billetterie
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE event_id = ? AND is_billetterie = 1", [body.event_id])
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

exports.deleteBilletterie = (req, res, next) => {
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

exports.closeBilletterie = (req, res, next) => {
    console.log({bodyClose : req.body})
    funcs.bddQuery(req.conBDA, "SELECT num_places, points, on_sale FROM newEvents WHERE event_id=?", [req.body.id_billetterie])
    .then(async data => {
        if (data != undefined && data.length > 0) {
            const infos = data[0];
            const numPlaces = infos.num_places, pointsToAdd = infos.points, onSale = infos.on_sale;
            if (onSale) {
                await funcs.bddQuery(req.conBDA, "UPDATE newPlaces SET status=0 WHERE event_id=?", [req.body.id_billetterie]);
                funcs.bddQuery(req.conBDA, "SELECT * FROM newUsers JOIN newPlaces ON newUsers.login = newPlaces.login WHERE event_id=? ORDER BY contributor DESC, points, place_ID", [req.body.id_billetterie])
                .then(async data => {
                    for (var i = 0; i < Math.min(numPlaces, data.length); i++) {
                        await funcs.bddQuery(req.conBDA, "UPDATE newPlaces SET status=1 WHERE event_id=? AND login=?", [req.body.id_billetterie, data[i].login]);
                        await funcs.bddQuery(req.conBDA, "UPDATE newUsers SET points=points+? WHERE login=?", [pointsToAdd, data[i].login]);
                    }
                    await funcs.bddQuery(req.conBDA, "UPDATE newEvents SET on_sale=0 WHERE event_id=?", [req.body.id_billetterie]);
                    funcs.sendSuccess(res, {message : "Evenement retiré de la vente avec succès !"})
                })
                .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error));
            } else {
                funcs.sendError(res, "Erreur, billetterie plus en vente");
            }
        } else {
            funcs.sendError(res, "Erreur, ID de billetterie non reconnue");
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error))
}

exports.reSaleBilletterie = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT points, on_sale FROM newEvents WHERE event_id=?", [req.body.id_billetterie])
    .then(async data => {
        console.log({data : data});
        if (data != undefined && data.length > 0) {
            const infos = data[0];
            console.log("here");
            const pointsToAdd = infos.points, onSale = infos.onSale;
            if (!onSale) {
                funcs.bddQuery(req.conBDA, "SELECT * FROM newPlaces WHERE event_id=? && status=1", [req.body.id_billetterie])
                .then(async data => {
                    console.log({data2 : data});
                    for (var i = 0; i < data.length; i++) {
                        console.log({datai : data[i], index : i});
                        await funcs.bddQuery(req.conBDA, "UPDATE newUsers SET points=points-? WHERE login=?", [pointsToAdd, data[i].login]);
                    }
                    console.log("here2");
                    await funcs.bddQuery(req.conBDA, "UPDATE newEvents SET on_sale=1 WHERE event_id=?", [req.body.id_billetterie]);
                    console.log("here3");
                    await funcs.bddQuery(req.conBDA, "UPDATE newPlaces SET status=-1 WHERE event_id=?", [req.body.id_billetterie]);
                    funcs.sendSuccess(res, {message : "Evenement remis en vente avec succès !"})
                })
                .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error));
            } else {
                funcs.sendError(res, "Erreur, billetterie déjà en vente");
            }
        } else {
            funcs.sendError(res, "Erreur, ID de billetterie non reconnue");
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error))
}

exports.givePlaceToUser = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT points, num_places FROM newEvents WHERE event_id=?", [req.body.id_billetterie])
    .then(async data => {
        if (data != undefined && data.length > 0) {
            const pointsToAdd = infos.points, numPlaces = infos.num_places;
            funcs.bddQuery(req.conBDA, "SELECT COUNT(*) FROM newPlaces WHERE event_id=? AND status=1", [req.body.id_billetterie])
            .then(async data => {
                console.log({dataCount : data});
                const numPlacesAttributed = data[0];

                if (numPlacesAttributed < numPlaces) {
                    await funcs.bddQuery(req.conBDA, "UPDATE newPlaces SET status=1 WHERE event_id=? AND login=?", [req.body.id_billetterie, req.loginToGivePlace]);
                    await funcs.bddQuery(req.conBDA, "UPDATE newUsers SET points=points+? WHERE login=?", [pointsToAdd, req.loginToGivePlace]);
                }
            })
        } else {
            funcs.sendError(res, "Erreur, ID de billetterie non reconnue");
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error));
}

exports.retirePlaceToUser = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT points FROM newEvents WHERE event_id=?", [req.body.id_billetterie])
    .then(async data => {
        if (data != undefined && data.length > 0) {
            const pointsToAdd = infos.points;
            await funcs.bddQuery(req.conBDA, "UPDATE newPlaces SET status=0 WHERE event_id=? AND login", [req.body.id_billetterie, req.loginToRetirePlace]);
            await funcs.bddQuery(req.conBDA, "UPDATE newUsers SET points=points-? WHERE login=?", [pointsToAdd, req.loginToRetirePlace]);
        } else {
            funcs.sendError(res, "Erreur, ID de billetterie non reconnue");
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur", error));
}

exports.getBilletteriesToCome = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE dateEvent > ? AND is_Billetterie = 1", [funcs.currentDate()])
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

exports.getAllBilletteries = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE is_billetterie = 1", [])
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

exports.deleteEvent = (req, res, next) => {

    const body = req.body;
    funcs.bddQuery(req.conBDA, "DELETE FROM newEvents WHERE event_id = ?", [body.event_id])
    .then(()=> {
        funcs.sendSuccess(res, {message : "Evenement supprimé !"})
    })
    .catch((error) => funcs.sendError(res, "Erreur lors de la suppression de l'évènement, contactez un administrateur.", error))
}