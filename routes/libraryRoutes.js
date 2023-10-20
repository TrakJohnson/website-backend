const express = require('express');
const router = express.Router();

// const auth = require('../middlewares/auth');
const libraryCtrl = require('../controllers/library');

router.get('/getBooks', libraryCtrl.getBooks);

module.exports = router;
