
const funcs = require('../functions/functions');

exports.updateClientGrid = (req, res, next) => {
    //req.placeHandler.acidStep()
    funcs.sendSuccess(res, {'grid': req.placeHandler.getGrid()});
}

exports.getPalette = (req, res, next) => {
    let palette = req.placeHandler.getPalette();
    console.log(palette)
    funcs.sendSuccess(res, {'nColor': req.placeHandler.nColor, 'colors': palette});
}

exports.requestPixelChange = (req, res, next) => {
    //console.log(req)
    req.placeHandler.updatePixel(req.body.pixel)
    funcs.sendSuccess(res, {msg: 'pixel changed !'})
}