const express = require('express');
const router = express.Router();

const recoverCtrl = require('../controllers/recover');

router.post('/demand', recoverCtrl.checkInfos, recoverCtrl.sendRecoverMail);



module.exports = router;
