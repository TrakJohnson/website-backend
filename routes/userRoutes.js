const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const loginCtrl = require('../controllers/login');

router.post('/login', loginCtrl.login);

module.exports = router;
