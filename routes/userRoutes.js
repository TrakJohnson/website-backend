const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const userCtrl = require('../controllers/user');

router.post('/login', userCtrl.login);
router.post('/register', userCtrl.createAccount, userCtrl.createDemandVerification, userCtrl.SendVerificationEmail);

module.exports = router;
