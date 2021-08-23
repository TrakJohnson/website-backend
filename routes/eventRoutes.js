const express = require('express');
const router = express.Router();

const eventCtrl = require('../controllers/event');

router.post('/getEventsTocome', eventCtrl.getEventsTocome);

// Manage billeterie
router.post('/createEvent', eventCtrl.createEvent);
router.post('/modifyEvent', eventCtrl.modifyEvent);
router.post('/deleteEvent', eventCtrl.deleteEvent);
router.get('/getAllEvents', eventCtrl.getAllEvents);
router.post('/getOneEvent', eventCtrl.getOneEvent)

module.exports = router;
