const funcs = require("./functions")

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

class PlaceHandler {
    width = 10
    height = 10
    
    grid = []
    palette = []
    
    constructor() {
        //this.grid = []
        //console.log(this.height)
        this.initPalette()
        for(let i = 0; i < this.height; i+=1)
        {
            let line = []
            for(let j = 0; j < this.width; j+=1){
                line.push(this.makePixel(1))
            }
            this.grid.push(line)
        }
        this.acidStep()
    }
    
    getGrid(){
        return this.grid;
    }
    
    initPalette(){
        let black = [0,0,0]
        let white = [255,255,255]
        let red = [200,60,78]
        let green = [25,200,100]
        let blue = [30,85,200]
        let yellow = [185,180,25]
        this.palette.push(black)
        this.palette.push(white)
        this.palette.push(red)
        this.palette.push(green)
        this.palette.push(blue)
        this.palette.push(yellow)
        
        this.nColor = this.palette.length
    }
    
    makePixel(c){
        return {colorIndex: c, colorHex: rgbToHex(...this.palette[c])}
    }
    
    acidStep()
    {
        let x = funcs.randInt(this.width);
        let y = funcs.randInt(this.height);
        //y = funcs.randInt(this.height);
        let v = funcs.randInt(this.nColor);
        let t = funcs.randInt(10)+3;
        //console.log(y, this.height)
        
        this.grid[y][x] = this.makePixel(v);
        
        setTimeout(()=>{this.acidStep()}, t*1000);
    }
    
    
}

module.exports = {PlaceHandler}