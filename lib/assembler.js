d_op_lookup = {
  'SET':0x1, 'ADD':0x2, 'SUB':0x3, 'MUL':0x4, 'DIV':0x5, 'MOD':0x6, 'SHL':0x7, 'SHR':0x8,
  'AND':0x9, 'BOR':0xa, 'XOR':0xb, 'IFE':0xc, 'IFN':0xd, 'IFG':0xe, 'IFB':0xf,
}
d_sop_lookup = {
  'JSR':0x01,
}
d_value_lookup = {
  'A':0x00, 'B':0x01, 'C':0x02, 'X':0x03, 'Y':0x04, 'Z':0x05, 'I':0x06, 'J':0x07,
  '[A]':0x08, '[B]':0x09, '[C]':0x0a, '[X]':0x0b, '[Y]':0x0c, '[Z]':0x0d, '[I]':0x0e, '[J]':0x0f,
  'POP':0x18, 'PEEK':0x19, 'PUSH':0x1a,
  'SP':0x1b, 'PC':0x1c, 'O':0x1d,
}
nw_value_lookup = {
 '+A]':0x10, '+B]':0x11, '+C]':0x12, '+X]':0x13,
 '+Y]':0x14, '+Z]':0x15, '+I]':0x16, '+J]':0x17,
}

hex_value_of = function(txt) {
  if(txt.indexOf('0x')==0) {
    return parseInt(txt,16);
  } else {
    return parseInt(txt);
  }
}

convert_value = function(value_txt) {
  var value = d_value_lookup[value_txt];
  var value_nw;
  var label_ref;
  if(typeof(value) == 'undefined') {
    if(value_txt.indexOf('[')==0) {
      if(value_txt.indexOf('+')!=-1) {
      } else {
        value_txt = value_txt.replace('[','').replace(']','').trim();
        value_nw = hex_value_of(value_txt);
        if(isNaN(value_nw)) {
          label_ref = value_txt;
        }
        value = 0x1e;  
      }
    } else {
      value_nw = hex_value_of(value_txt);
      if(value_nw>=0x00 && value_nw<=0x1f) {
        value = value_nw+0x20;
        value_nw = undefined;  
      } else {
        value = 0x1f;
      }
    }
  } else {
    label_ref = value_text;
  }
  return {value:value,nw:value_nw,label_ref:label_ref};
}


assemble = function(source) {
  var byte_code = [];
  
  var source_lines = source.split('\n');
  var labels = {};
  for(var i=0;i<source_lines.length;i++) {
    var line = source_lines[i].trim();
    if(line == '') continue;
        
    // Remove the comments
    //
    var comment_index = line.indexOf(';');
    if(comment_index != -1)
      line = line.replace(line.substring(comment_index),'');
    // Remove and note the labels
    //
    var label_index = line.indexOf(':');
    if(label_index != -1) {
      var label = line.substr(0,label_index);
      labels[label] = {offset:byte_code.length,refs:[]};
      line = line.replace(line.substr(0,label_index+1),'');
    }
    line = line.trim();
    // Now split the actual command from the parameters
    //
    var tokens = line.split(' ');
    var op_txt = tokens[0].trim();
    var parms = tokens[1].split(',');
    var a_txt = parms[0].trim();
    var b_txt = parms[1].trim();
    // Now do the byte code conversions
    //
    var op = d_op_lookup[op_txt];
    var a = convert_value(a_txt,labels);
    var b = convert_value(b_txt,labels);
    // Finally push the byte codes onto the return stack
    //
    byte_code.push(op | (a.value<<4) | (b.value<<10));
    if(a.nw) byte_code.push(a.nw);
    if(b.nw) byte_code.push(b.nw);
  }  
  console.log(labels);
  return {byte_code:byte_code,labels:labels};
}

if(typeof(exports) != 'undefined') {
  exports.assemble = assemble;
} 

