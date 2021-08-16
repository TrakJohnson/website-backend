const express = require('express');
const router = express.Router();

// const auth = require('../middlewares/auth');
const polesCtrl = require('../controllers/pole');

router.get('/getPoles', polesCtrl.getPoles);

module.exports = router;
