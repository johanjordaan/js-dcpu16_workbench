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

// Takes a label structure and returns a dictionary of offsets with their labels
//
generate_label_by_offset_lookup = function(labels) {
  var ret_val = {}

  var label_keys = Object.keys(labels);
  for (var i =0;i<label_keys.length;i++) {
    ret_val[labels[label_keys[i]].offset] = label_keys[i];
  }  
  
  return ret_val;
}

// Takes a label strucrure and returns a dictionary of all offsets with their label refs
//
generate_label_by_ref_offset_lookup = function(labels) {
  var ret_val = {}

  var label_keys = Object.keys(labels);
  for (var i =0;i<label_keys.length;i++) {
    var refs = labels[label_keys[i]].refs; 
    for(var j=0;j<refs.length;j++)
      ret_val[refs[j]] = label_keys[i];
  }  
  
  return ret_val;
}

txt_for_value = function(val,byte_code,i,label_by_ref_offset_lookup) {
  var ret_val = val;
  var delta = 0;
  if(ret_val>=0x20 && ret_val<=0x3f) ret_val = (ret_val-0x20).toString(16); else ret_val = value_lookup[ret_val];
  if(ret_val.indexOf('nw')!=-1) {
    var label = label_by_ref_offset_lookup[i+(++delta)];
    if(typeof(label)=='undefined')
      ret_val = ret_val.replace('nw','0x'+byte_code[++i].toString(16));
    else
      ret_val = ret_val.replace('nw',label);
  }
  return {txt:ret_val,delta:delta};
}

// Return structure :
//  source = \n, seperated string of source code
//  lines = a line structure for eachj line of source code
//    lines.txt = The actual text from the deassembler
//    lines.byte_code = The byte code for the line
//    lines.mem_pos = The location in meroy where this line starts
deassemble = function(byte_code,labels) {
  if(typeof(labels)=='undefined')
    labels = {}
  var label_by_offset_lookup = generate_label_by_offset_lookup(labels);
  var label_by_ref_offset_lookup = generate_label_by_ref_offset_lookup(labels);
  
  var source = '';
  var lines = [];
  var op,a,b;
  var op_txt,a_txt,b_txt;
  for(var i=0;i<byte_code.length;i++) {
    var line = {txt:'',byte_code:[],mem_pos:i};

    line.byte_code.push(byte_code[i]);
    op = byte_code[i] & 0x000F;
    a = (byte_code[i]>>4) & 0x003F;
    b = (byte_code[i]>>10) & 0x003F

    var label = label_by_offset_lookup[i];
    if(typeof(label) != 'undefined')
      line.txt += label + ': ';
    
    if(op_txt=0x0) {

      op_txt = sop_lookup[op];
      a_txt = txt_for_value(b,byte_code,i,label_by_ref_offset_lookup);
      i+=a_txt.delta;
      
      line.txt += op_txt+' '+a_txt.txt;
    } else {

      op_txt = op_lookup[op];
      a_txt = txt_for_value(a,byte_code,i,label_by_ref_offset_lookup);
      for(var j=0;j<a_txt.delta;j++)
        line.byte_code.push(byte_code[i+j+1]);
      i+=a_txt.delta;
      b_txt = txt_for_value(b,byte_code,i,label_by_ref_offset_lookup);
      for(var j=0;j<b_txt.delta;j++)
        line.byte_code.push(byte_code[i+j+1]);
      i+=b_txt.delta;
      
      line.txt += op_txt+' '+a_txt.txt+','+b_txt.txt;
    }
    lines.push(line);
    source += line.txt+'\n';
  }
  return {source:source,lines:lines};
}

if(typeof(exports) != 'undefined') {
  exports.deassemble = deassemble;
} 
