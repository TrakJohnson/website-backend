const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const userCtrl = require('../controllers/user');

router.post('/login', userCtrl.login);
router.post('/register', userCtrl.createAccount, userCtrl.createDemandVerification, userCtrl.SendVerificationEmail);
router.post('/loginFromToken', auth.findLoginInToken, userCtrl.loginFromToken);
router.post('/verify', userCtrl.VerifyEmail)
router.post('/changeInfos', auth.findLoginInToken, userCtrl.modifyAccount)


module.exports = router;
