const express = require('express');
const router = express.Router();

const eventCtrl = require('../controllers/event');

router.post('/getEventsTocome', eventCtrl.getEventsTocome);

// Manage billeterie
router.post('/createBilletterie', eventCtrl.createBilletterie);
router.post('/modifyBilletterie', eventCtrl.modifyBilletterie);
router.post('/deleteBilletterie', eventCtrl.deleteBilletterie);
router.get('/getAllEvents', eventCtrl.getAllEvents);
router.post('/getOneBilletterie', eventCtrl.getOneBilletterie)

module.exports = router;
