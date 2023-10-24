const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const userCtrl = require('../controllers/user');

router.post('/login', userCtrl.login);
router.post('/register', userCtrl.createAccount, userCtrl.createDemandVerification, userCtrl.SendVerificationEmail);
router.post('/portailInfo', userCtrl.getPortailInfo)
router.post('/loginFromToken', auth.findLoginInToken, userCtrl.loginFromToken);
router.post('/verify', userCtrl.VerifyEmail)
router.post('/changeInfos', auth.findLoginInToken, userCtrl.modifyAccount)
router.post('/claimePlace', auth.authToken, userCtrl.claimePlace)
router.post('/declaimePlace', auth.authToken, userCtrl.declaimePlace)
router.get('/getPlacesClaimedByUser', auth.authToken, userCtrl.getPlacesClaimedByUser)
router.post('/modifySubscriber', auth.findLoginInToken, userCtrl.modifySubscriber);


module.exports = router;
