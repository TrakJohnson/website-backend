const express = require('express');
const router = express.Router();

const recoverCtrl = require('../controllers/recover');

router.post('/demand', recoverCtrl.checkInfos, recoverCtrl.sendRecoverMail);
router.post('/changePassword/', recoverCtrl.changePassword)



module.exports = router;
