d_asm_lookup = {
  'DAT':0x1,
}
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
  var value = d_value_lookup[value_txt.toUpperCase()];
  var value_nw;
  var label_ref;
  if(typeof(value) == 'undefined') {
    if(value_txt.indexOf('[')==0) {
      if(value_txt.indexOf('+')!=-1) {
      } else {
        // Handle values starting with [ and ending with ] 
        //
        value_txt = value_txt.replace('[','').replace(']','').trim();
        value_nw = hex_value_of(value_txt);
        // If the value is not a number then it must be a label ref
        // We assume that if its a label ref that an extra word is required.
        // The actual value of the next word will be set to 0x00 as a place holder
        // later when we do the label replace ment we will retro pack if the label location 
        //
        if(isNaN(value_nw)) {
          label_ref = value_txt;
          value_nw = 0x0;
        }
        value = 0x1e;  
      }
    } else {
      value_nw = hex_value_of(value_txt);
      if(isNaN(value_nw)) {
        value = 0x1f;
        value_nw = 0x0;
        label_ref = value_txt;
      } else  {
        // Handle literals with packing 
        //
        if(value_nw>=0x00 && value_nw<=0x1f) {
          value = value_nw+0x20;
          value_nw = undefined;  
        } else {
          value = 0x1f;
        }
      }
    }
  } else {
  }
  return {value:value,nw:value_nw,label_ref:label_ref};
}

// Returns a structure :
//  byte code :  array of words
//  labels : dictionary of objects (label as key)
//    label : offeset = index into byte code (relative)
//    refs  : offsets to words that refs the label
//
assemble = function(source) {
  var byte_code = [];
  
  var source_lines = source.split('\n');
  var label_keys = [];
  var labels = {};
  var label_refs = {};
  for(var i=0;i<source_lines.length;i++) {
    var line = source_lines[i].replace('\t',' ').trim();
    if(line == '') continue;
        
    // Remove the comments
    //
    var comment_index = line.indexOf(';');
    if(comment_index != -1)
      line = line.replace(line.substring(comment_index),'').trim();
    if(line == '') continue;
    // Remove and note the labels
    //
    var label_start_index = line.indexOf(':');
    if(label_start_index != -1) {
	  var label_end_index = line.indexOf(' ');
	  var label = '';
	  if(label_end_index==-1) {
		label = line;
		continue;
	  } else {
		label = line.substring(label_start_index+1,label_end_index);
		line = line.replace(line.substring(label_start_index,label_end_index+1),'').trim();
	  }
	  label_keys.push(label);
      labels[label] = {offset:byte_code.length};
    }
	
    // Now split the actual command from the parameters
    // and do the byte code conversions
    //
    var tokens = line.split(' ');
    var op_txt = tokens[0].trim();
    var parms = tokens[1].split(',');
    var op = d_op_lookup[op_txt];
    var a,b;
	if(op_txt == 'DAT') {
	  op = parseInt(parms[0]);
	  var a = {value:0x0}
	  var b = {value:0x0}
	} else if(typeof(op) == 'undefined') {
      op = 0x0;
      var sop = d_sop_lookup[op_txt];  
      var a =  {value:sop};
      var b_txt = parms[0].trim();
      b = convert_value(b_txt,labels);
    } else {
      var a_txt = parms[0].trim();
      var b_txt = parms[1].trim();
      a = convert_value(a_txt,labels);
      b = convert_value(b_txt,labels);
    }
    // Finally push the byte codes onto the return stack
    // + keep track of the label refs
    //
    byte_code.push(op | (a.value<<4) | (b.value<<10));

    if(typeof(a.label_ref) != 'undefined') {
      if(typeof(label_refs[a.label_ref]) == 'undefined')
        label_refs[a.label_ref] = [];
      label_refs[a.label_ref].push(byte_code.length);
    }
    if(typeof(a.nw) != 'undefined') byte_code.push(a.nw);

    if(typeof(b.label_ref) != 'undefined') {
      if(typeof(label_refs[b.label_ref]) == 'undefined')
        label_refs[b.label_ref] = [];
      label_refs[b.label_ref].push(byte_code.length);
    }
    if(typeof(b.nw) != 'undefined') byte_code.push(b.nw);
  }  
  
  // Update all the label ref's
  //
  for(var i=0;i<label_keys.length;i++) {
    var label = label_keys[i];
    var offset = labels[label].offset;
    var refs = label_refs[label];
	if(typeof(refs) == 'undefined') continue;
    for(var j=0;j<refs.length;j++) {
      byte_code[refs[j]] = offset;
    }
    labels[label].refs = label_refs[label];
  }
  //console.log(labels);
  //var str = [];
  //for(var i=0;i<byte_code.length;i++) str.push(byte_code[i].toString(16));
  //console.log(byte_code,str);
  return {byte_code:byte_code,labels:labels};
}

if(typeof(exports) != 'undefined') {
  exports.assemble = assemble;
} 

