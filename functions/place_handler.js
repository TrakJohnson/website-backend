const funcs = require("./functions")

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/*function rgbToHex(c){
    return rgbToHex(...c)
}*/

class PlaceHandler {
    width = 100
    height = 100
    
    grid = []
    palette = []
    
    acideRate = 10*60; //every ten minutes a random pixel is changed
    
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
        
        this.acidRate = 10*60;
        setInterval(()=>{this.acidStep()},this.acidRate*10000);
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
        console.log("wtf")
        let x = funcs.randInt(this.width);
        let y = funcs.randInt(this.height);
        //y = funcs.randInt(this.height);
        let v = funcs.randInt(this.nColor);
        //let t = funcs.randInt(15)+8;
        //t = 3600/2
        //console.log(y, this.height)
        
        this.grid[y][x] = this.makePixel(v);
        
        //setTimeout(()=>{this.acidStep()}, t*1000);
    }
    
    updatePixel(pixel){
        console.log(pixel)
        this.grid[pixel.y][pixel.x] = this.makePixel(pixel.colorIndex)
    }
    
    getPalette(){
        return this.palette.map((c,index)=>{
            return {   colorHex: rgbToHex(...c),
                colorIndex: index
            }
        })
    }
    
}

module.exports = {PlaceHandler}