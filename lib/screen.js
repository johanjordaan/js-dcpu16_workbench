var color_lookup = {
  0x0:'#000000', 0x1:'#0000aa' ,0x2:'#00aa00', 0x3:'#00aaaa',
  0x4:'#aa0000', 0x5:'#aa00aa' ,0x6:'#aa5500', 0x7:'#aaaaaa',
  0x8:'#555555', 0x9:'#5555ff' ,0xa:'#55ff55', 0xb:'#55ffff',
  0xc:'#ff5555', 0xd:'#ff55ff' ,0xe:'#ffff55', 0xf:'#ffffff',
}

Screen = function(cpu,screen_element,size) {
  this.cpu = cpu;
  screen_element.width = (32-1)*4*size;
  screen_element.height = (12-1)*8*size;
  this.ctx = screen_element.getContext("2d");
  this.size = size;
}

Screen.prototype.update = function() {
  var data_index = 0x8000;
  for(var r=0;r<12;r++,data_index++) {
    for(var c=0;c<32;c++,data_index++){
      // Unpack the data structure
      //
      var CCCCCCC = this.cpu.memory[data_index]&0x7F
      var B = (this.cpu.memory[data_index]&0x80)>>7;
      var HRGB_FG = (this.cpu.memory[data_index]&0xF000)>>12;
      var HRGB_BG = (this.cpu.memory[data_index]&0x0F00)>>8;

      // Unpack the colors
      //
      var FG = color_lookup[HRGB_FG];
      var BG = color_lookup[HRGB_BG];
      
      // Retrieve the chracter data pointed to be CCCCCCC
      //
      var character_data = this.cpu.memory[0x8180+CCCCCCC];
      
      var mask = 0x8000;
      for(var cc=0;cc<4;cc++) {
        if(mask==0) {
          mask = 0x8000;
          character_data = this.cpu.memory[0x8180+CCCCCCC+1];
        }
        for(var rr=0;rr<8;rr++) {
          if(character_data&mask)          
            this.ctx.fillStyle=FG;
          else
            this.ctx.fillStyle=BG;
          this.ctx.fillRect((c*4+cc)*this.size , (r*8+rr)*this.size ,this.size,this.size);
          mask = mask>>1;
        }
      }
    }
  }
}