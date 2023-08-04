const express = require('express');
const router = express.Router();

const placeController = require('../controllers/place');
router.get('/', placeController.updateClientGrid)
router.get('/palette', placeController.getPalette)
//router.post('/csdcs', placeController.dfvd);

module.exports = router;
