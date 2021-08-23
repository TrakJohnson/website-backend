const express = require('express');
const router = express.Router();

const eventCtrl = require('../controllers/event');
const { route } = require('./userRoutes');


// Fonctions communes à tous les events
router.post('/getOneEvent', eventCtrl.getOneEvent);
router.get('/getAllEvents', eventCtrl.getAllEvents);
router.get('/getEventsTocome', eventCtrl.getEventsTocome);

// Manage billeterie
router.get('/getBilletteriesToCome', eventCtrl.getBilletteriesToCome);
router.get('/getAllBilletteries', eventCtrl.getAllBilletteries);
router.post("/closeBilletterie", eventCtrl.closeBilletterie);
router.post("/reSaleBilletterie", eventCtrl.reSaleBilletterie);
router.post("/givePlaceToUser", eventCtrl.givePlaceToUser);
router.post("/retirePlaceToUser", eventCtrl.retirePlaceToUser);

// Management des events hors billetterie (pas de places à gérer) is_billetterie = 0
router.post('/createEvent', eventCtrl.createEvent);
router.post('/modifyEvent', eventCtrl.modifyEvent);
router.post('/deleteEvent', eventCtrl.deleteEvent);

module.exports = router;
