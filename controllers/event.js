
const funcs = require('../functions/functions');
const Event = require('../models/event');
const Place = require('../models/place');

const getPlacesClaimedForEvent = async (conBda, event_id) => {
    return await funcs.bddQuery(conBDA, "SELECT * FROM newPlaces WHERE event_id = ?", [event_id])
    .then(async data => {
        var placesClaimed = [];
        if (data && data.length > 0) {
            placesClaimed = await data.map(placeData => new Place(placeData));
        }
        return placesClaimed;
    })
    .catch((error) => {console.log({error : error}); return []});
}

exports.getOneEvent = (req, res, next) =>{
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE event_id = ?", [req.query.event_id])
    .then(async (data) => {
        if (data == undefined || data.length <1) {
            funcs.sendError(res, "Pas d'évènement avec cet id", data)
        } else {
            data[0].placesClaimed = await getPlacesClaimedForEvent(req.conBDA, req.query.event_id);
            var event = new Event(data[0]);
            funcs.sendSuccess(res, event);
        }
    })
    .catch((error)=>{funcs.sendError(res, "Erreur, merci de contacter un administrateur", error)})
}

exports.getAllEvents = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents", [])
    .then(async (data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var eventsToSendToFrond = [];
            const getData = async () => {
                for (var index = 0; index < data.length - 1; index++) {
                    const eventData = data[index];
                    console.log({eventName : eventData.title});
                    eventData.placesClaimed = await getPlacesClaimedForEvent(req.conBDA, eventData.event_id);
                    console.log({eventName : eventData.title, placesClaimed : eventData.placesClaimed, index : index});
                    eventsToSendToFrond.push(new Event(eventData));
                }
            }
            await getData();
            console.log("sent all events !");
            funcs.sendSuccess(res, eventsToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

exports.getEventsTocome = (req, res, next) => {
    console.log("events to come")
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE dateEvent > ?", [funcs.currentDate()])
    .then(async (data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, []);
        } else {
            var eventsToSendToFrond = [];
            const getData = async () => {
                for (var index = 0; index < data.length - 1; index++) {
                    const eventData = data[index];
                    console.log({eventName : eventData.title});
                    eventData.placesClaimed = await getPlacesClaimedForEvent(req.conBDA, eventData.event_id);
                    console.log({eventName : eventData.title, placesClaimed : eventData.placesClaimed, index : index});
                    eventsToSendToFrond.push(new Event(eventData));
                }
            }
            await getData();
            console.log({eventsToSendToFrond : eventsToSendToFrond.length});
            funcs.sendSuccess(res, eventsToSendToFrond);
            
        }
    }) 
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

exports.createEvent = (req, res, next) => {
    const body = req.body;
    funcs.bddQuery(req.conBDA, "INSERT INTO `newEvents` (`event_id`, `title`, `description`, `dateEvent`, `dateEvent_end`, `event_place`, `pole_id`, `login_creator`, `date_open`, `date_close`, `num_places`, `cost_contributor`, `cost_non_contributor`, `points`, `on_sale`, `thumbnail`, `is_billetterie`) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [body.title , body.description , body.dateEvent, body.dateEvent_end, body.event_place , body.pole_id , body.loginSender , body.date_open , body.date_close , body.num_places , body.cost_contributor,  body.cost_non_contributor, body.points, 0 /* Billetterie fermée lors de sa création*/, body.thumbnail, body.is_billetterie])
    .then(() => funcs.sendSuccess(res, {message : "Evenement créé !"}))
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-1 & 405)", error))
    
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
                    funcs.bddQuery(req.conBDA, "UPDATE newEvents SET title=?, description=?, dateEvent=?, dateEvent_end=?, event_place=?, pole_id=?, date_open=?, date_close=?, num_places=?, cost_contributor=?, cost_non_contributor=?, points=?, on_sale = ?, thumbnail = ?, is_billetterie = ?  WHERE event_id = ?", [event.title , event.description , event.dateEvent, event.dateEvent_end , event.event_place , event.pole_id, event.date_open , event.date_close , event.num_places , event.cost_contributor,  event.cost_non_contributor, event.points, event.on_sale, body.thumbnail, body.is_billetterie,  event.event_id])
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
            funcs.bddQuery(req.conBDA, "UPDATE newEvents SET title=?, description=?, dateEvent=?, dateEvent_end=?, event_place=?, pole_id=?, date_open=?, date_close=?, num_places=?, cost_contributor=?, cost_non_contributor=?, points=?, on_sale = ?, thumbnail = ?, is_billetterie = ?  WHERE event_id = ?", [event.title , event.description , event.dateEvent, event.dateEvent_end , event.event_place , event.pole_id, event.date_open , event.date_close , event.num_places , event.cost_contributor,  event.cost_non_contributor, event.points, event.on_sale, body.thumbnail, body.is_billetterie, event.event_id])
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
    .then(async (data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var eventsToSendToFrond = [];
            const getData = async () => {
                for (var index = 0; index < data.length - 1; index++) {
                    const eventData = data[index];
                    console.log({eventName : eventData.title});
                    eventData.placesClaimed = await getPlacesClaimedForEvent(req.conBDA, eventData.event_id);
                    console.log({eventName : eventData.title, placesClaimed : eventData.placesClaimed, index : index});
                    eventsToSendToFrond.push(new Event(eventData));
                }
            }
            await getData();
            funcs.sendSuccess(res, eventsToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}

exports.getAllBilletteries = (req, res, next) => {
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE is_billetterie = 1", [])
    .then(async (data) => {
        if (data == undefined || data.length < 1) {
            funcs.sendSuccess(res, [])
        } else {
            var eventsToSendToFrond = [];
            const getData = async () => {
                for (var index = 0; index < data.length - 1; index++) {
                    const eventData = data[index];
                    console.log({eventName : eventData.title});
                    eventData.placesClaimed = await getPlacesClaimedForEvent(req.conBDA, eventData.event_id);
                    console.log({eventName : eventData.title, placesClaimed : eventData.placesClaimed, index : index});
                    eventsToSendToFrond.push(new Event(eventData));
                }
            }
            await getData();
            funcs.sendSuccess(res, eventsToSendToFrond);
        }
    })
    .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-0 & 405)", error))
}



exports.modifyEvent = (req, res, next) => {
    const body = req.body;
 

    if (body.event_id == undefined) {
        return funcs.sendError(res, "Pas d'ID de Event fourni");
    }

    // Ensuite on récupère les infos actuelles de la Billetterie
    funcs.bddQuery(req.conBDA, "SELECT * FROM newEvents WHERE event_id = ? AND is_billetterie = 1", [body.event_id])
    .then((data) => {
        if (data == undefined || data.length < 1){
            return funcs.sendError(res, "ID de Event non reconnu");
        }

        var event = new Event(data);
        funcs.bddQuery(req.conBDA, "UPDATE newEvents SET title=?, description=?, dateEvent=?, dateEvent_end=?, event_place=?, pole_id=?, num_places=?, cost_contributor=?, cost_non_contributor=?, thumbnail = ? WHERE event_id = ?", [event.title , event.description , event.dateEvent , event.dateEvent_end, event.event_place , event.pole_id, event.date_open , event.date_close , event.num_places , event.cost_contributor,  event.cost_non_contributor, event.points, event.on_sale, body.thumbnail, body.is_billetterie,  event.event_id])
        .then(() => funcs.sendSuccess(res, {message : "Evenement modifié !"}))
        .catch((error) => funcs.sendError(res, "Erreur, veuillez contacter l'administrateur, (codes erreurs : 205-2 & 405)", error))

    })
    .catch((error)=> funcs.sendError(res, "Impossible de mofifier la billetterie, merci de contacter un administrateur.", error))
}



exports.deleteEvent = (req, res, next) => {

    // On a juste à supprimer l'évènement (pas de place liée)

    const body = req.body;
    funcs.bddQuery(req.conBDA, "DELETE FROM newEvents WHERE event_id = ?", [body.event_id])
    .then(()=> {
        funcs.sendSuccess(res, {message : "Evenement supprimé !"})
    })
    .catch((error) => funcs.sendError(res, "Erreur lors de la suppression de l'évènement, contactez un administrateur.", error))
}