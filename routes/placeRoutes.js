const express = require('express');
const router = express.Router();

const placeController = require('../controllers/place');
router.get('/', placeController.updateClientGrid)
//router.post('/csdcs', placeController.dfvd);

module.exports = router;
