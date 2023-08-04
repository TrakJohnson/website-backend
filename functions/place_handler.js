const funcs = require("./functions")

class PlaceHandler {
    width = 10
    height = 10
    grid = []
    constructor() {
        //this.grid = []
        //console.log(this.height)
        for(let i = 0; i < this.height; i+=1)
        {
            let line = []
            for(let j = 0; j < this.width; j+=1){
                line.push({'color': i*this.width+j})
            }
            this.grid.push(line)
        }
        this.acidStep()
    }
    
    getGrid(){
        return this.grid;
    }
    
    acidStep()
    {
        let x = funcs.randInt(this.width);
        let y = funcs.randInt(this.height);
        //y = funcs.randInt(this.height);
        let v = funcs.randInt(100);
        let t = funcs.randInt(20)+3;
        //console.log(y, this.height)
        
        this.grid[y][x] = {color: v};
        
        setTimeout(()=>{this.acidStep()}, t*1000);
    }
}

module.exports = {PlaceHandler}