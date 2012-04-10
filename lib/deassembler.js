op_lookup = {
  0x1:'SET', 0x2:'ADD', 0x3:'SUB', 0x4:'MUL', 0x5:'DIV', 0x6:'MOD', 0x7:'SHL', 0x8:'SHR',
  0x9:'AND', 0xa:'BOR', 0xb:'XOR', 0xc:'IFE', 0xd:'IFN', 0xe:'IFG', 0xf:'IFB',
}
sop_lookup = {
  0x01:'JSR',
}
value_lookup = {
  0x00:'A', 0x01:'B', 0x02:'C', 0x03:'X', 0x04:'Y', 0x05:'Z', 0x06:'I', 0x07:'J',
  0x08:'[A]', 0x09:'[B]', 0x0a:'[C]', 0x0b:'[X]', 0x0c:'[Y]', 0x0d:'[Z]', 0x0e:'[I]', 0x0f:'[J]',
  0x10:'[nw+A]',0x11:'[nw+B]',0x12:'[nw+C]',0x13:'[nw+X]',
  0x14:'[nw+Y]',0x15:'[nw+Z]',0x16:'[nw+I]',0x17:'[nw+J]',
  0x18:'POP',0x19:'PEEK',0x1a:'PUSH',
  0x1b:'SP',0x1c:'PC',0x1d:'O',
  0x1e:'[nw]',0x1f:'nw',
}


deassemble = function(byte_code) {
  var ret_val = '';
  var op,a,b;
  var op_txt,a_txt,b_txt;
  for(var i=0;i<byte_code.length;i++) {
    op = byte_code[i] & 0x000F;
    a = (byte_code[i]>>4) & 0x003F;
    b = (byte_code[i]>>10) & 0x003F

    if(op_txt=0x0) {

      op_txt = sop_lookup[op];

      if(b>=0x20 && b<=0x3f) a_txt = b-0x20; else a_txt = value_lookup[b];
      
      if(a_txt.indexOf('nw')!=-1)
        a_txt = a_txt.replace('nw','0x'+byte_code[++i].toString(16));

      ret_val += op_txt+' '+a_txt+'\n'  ;
    
    } else {

      op_txt = op_lookup[op];

      if(a>=0x20 && a<=0x3f) a_txt = a-0x20; else a_txt = value_lookup[a];
      if(b>=0x20 && b<=0x3f) b_txt = b-0x20; else b_txt = value_lookup[b];

      if(a_txt.indexOf('nw')!=-1)
        a_txt = a_txt.replace('nw','0x'+byte_code[++i].toString(16));
      if(b_txt.indexOf('nw')!=-1)
        b_txt = b_txt.replace('nw','0x'+byte_code[++i].toString(16));
        
      ret_val += op_txt+' '+a_txt+','+b_txt+'\n'  ;
    }
  }
  return ret_val;
}

if(typeof(exports) != 'undefined') {
  exports.deassemble = deassemble;
} 
