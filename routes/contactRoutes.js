const express = require('express');
const router = express.Router();

const contactCtrl = require('../controllers/contact');

router.post('/sendMail', contactCtrl.sendMail);

module.exports = router;