
const funcs = require('../functions/functions');

exports.updateClientGrid = (req, res, next) => {
    //req.placeHandler.acidStep()
    funcs.sendSuccess(res, {'grid': req.placeHandler.getGrid()});
}