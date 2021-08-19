const express = require('express');
const router = express.Router();

const recoverCtrl = require('../controllers/recover');
const auth = require('../middlewares/auth');

router.post('/demand', recoverCtrl.checkInfos, recoverCtrl.sendRecoverMail);
router.post('/changePassword/', auth.findLoginInToken, recoverCtrl.changePassword)



module.exports = router;
