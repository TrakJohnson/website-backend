const express = require('express');
const router = express.Router();

const eventCtrl = require('../controllers/event');
const { route } = require('./userRoutes');


// Fonctions communes à tous les events
router.post('/getOneEvent', eventCtrl.getOneEvent)
router.get('/getAllEvents', eventCtrl.getAllEvents);
router.post('/getEventsTocome', eventCtrl.getEventsTocome);

// Manage billeterie
<<<<<<< HEAD
router.post('/createEvent', eventCtrl.createEvent);
router.post('/modifyEvent', eventCtrl.modifyEvent);
router.post('/deleteEvent', eventCtrl.deleteEvent);
router.get('/getAllEvents', eventCtrl.getAllEvents);
router.post('/getOneEvent', eventCtrl.getOneEvent)
=======
router.post('/createBilletterie', eventCtrl.createBilletterie);
router.post('/modifyBilletterie', eventCtrl.modifyBilletterie);
router.post('/deleteBilletterie', eventCtrl.deleteBilletterie);
router.post('/getBilletteriesToCome', eventCtrl.getBilletteriesToCome);
router.post('/getAllBilletteris', eventCtrl.getAllBilletteries)


// Management des events hors billetterie (pas de places à gérer) is_billetterie = 0
// router.post('/createEvent', eventCtrl.createEvent);
// router.post('/modifyEvent', eventCtrl.createEvent);
router.post('/deleteEvent', eventCtrl.deleteEvent);


>>>>>>> 0d297cdf7d62cb9be91a7ac1d23eaf30649e5a7a

module.exports = router;
