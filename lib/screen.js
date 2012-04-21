// HRGB HRGB B CCCCCCC
// 
var color_lookup = {
  0x0:'#000000', 0x1:'#0000aa' ,0x2:'#00aa00', 0x3:'#00aaaa',
  0x4:'#aa0000', 0x5:'#aa00aa' ,0x6:'#aa5500', 0x7:'#aaaaaa',
  0x8:'#555555', 0x9:'#5555ff' ,0xa:'#55ff55', 0xb:'#55ffff',
  0xc:'#ff5555', 0xd:'#ff55ff' ,0xe:'#ffff55', 0xf:'#ffffff',
}

update_screen = function(screen_element,data,character_map,multiplier) {
  if(multiplier == 'undefined')
    multiplier = 1;
  var m = multiplier;
  
  var ctx = screen_element.getContext("2d");

  var data_index = 0;
  for(var r=0;r<12;r++,data_index++) {
    for(var c=0;c<32;c++,data_index++){
      // Unpack the data structure
      //
      var CCCCCCC = data[data_index]&0x7F
      var B = (data[data_index]&0x80)>>7;
      var HRGB_FG = (data[data_index]&0xF000)>>12;
      var HRGB_BG = (data[data_index]&0x0F00)>>8;

      // Unpack the colors
      //
      var FG = color_lookup[HRGB_FG];
      var BG = color_lookup[HRGB_BG];
      
      // Retrieve the chracter data pointed to be CCCCCCC
      //
      var character_data = character_map[CCCCCCC];
      
      var mask = 0x8000;
      for(var cc=0;cc<4;cc++) {
        if(mask==0) {
          mask = 0x8000;
          character_data = character_map[CCCCCCC+1];
        }
        for(var rr=0;rr<8;rr++) {
          if(character_data&mask)          
            ctx.fillStyle=FG;
          else
            ctx.fillStyle=BG;
          ctx.fillRect((c*4+cc)*m , (r*8+rr)*m ,m,m);
          mask = mask>>1;
        }
      }
    }
  }
}