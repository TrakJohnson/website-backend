
const funcs = require('../functions/functions');

exports.updateClientGrid = (req, res, next) => {
    //req.placeHandler.acidStep()
    funcs.sendSuccess(res, {'grid': req.placeHandler.getGrid()});
}

exports.getPalette = (req, res, next) => {
    funcs.sendSuccess(res, {'nColor': req.placeHandler.nColor, 'colors': req.placeHandler.palette});
}