
const funcs = require('../functions/functions');

exports.updateClientGrid = (req, res, next) => {
    grid = []
    for(let i = 0; i < 10; i+=1)
    {
        line = []
        for(let j = 0; j < 10; j+=1){
            line.push({'color': i*10+j})
        }
        grid.push(line)
    }
    funcs.sendSuccess(res, {'grid': grid});
}