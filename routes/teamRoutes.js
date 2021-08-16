const express = require('express');
const router = express.Router();

// const auth = require('../middlewares/auth');
const teamCtrl = require('../controllers/team');

router.get('/getMembers', teamCtrl.getMembers);

module.exports = router;
