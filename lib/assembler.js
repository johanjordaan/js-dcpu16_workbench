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
d_nw_value_lookup = {
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
      var tokens = value_txt.split('+');
      var value_nw = tokens[0].replace('[','').trim();
      var value = d_nw_value_lookup['+'+tokens[1].trim()];
      
      if(isNaN(value_nw)) {
        label_ref = value_nw;
        value_nw = 0x0;
      }
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
//  errors : an array of errots structures
//    line : Line on which the error occurs
//    msg  : error message    
//    type : error/warning
//
assemble = function(source) {
  var byte_code = [];
  var errors = [];
  
  var source_lines = source.split('\n');
  var label_keys = [];
  var labels = {};            // Lables structure { label:{offset:??,refs:[]} } 
  var label_refs = {};        // Label refs { label:{mem_pos:[],source_line:[]} } 
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
        label = line.replace(':','').trim();
        label_keys.push(label);
        labels[label] = {offset:byte_code.length};
        continue;
      } else {
        label = line.substring(label_start_index+1,label_end_index);
        line = line.replace(line.substring(label_start_index,label_end_index+1),'').trim();
        label_keys.push(label);
        labels[label] = {offset:byte_code.length};
      }
    }
	
    // Now split the actual command from the parameters
    // and do the byte code conversions
    //
    var op_index = line.indexOf(' ');
    var op_txt,parms;
    if(op_index != -1) {
      op_txt = line.substring(0,op_index).trim().toUpperCase();
      parms = line.substring(op_index).split(',');
    } else {
      op_txt = line.trim().toUpperCase();
      parms = []
    }
    var op = d_op_lookup[op_txt];
    var a,b;
    if(op_txt == 'DAT') {
      if(parms.length<1) {
        errors.push({line:i,type:'ERROR',msg:'[DAT] Requires at least one parameter.'});
        continue;
      }

      for(var p=0;p<parms.length;p++) {
        var data = parseInt(parms[p].trim());
        if(isNaN(data)) {
          data = parms[p].trim().replace(/"/g,'');  
          for(var di=0;di<data.length;di++) {
            byte_code.push(data[di].charCodeAt(0));
          }          
        } else {
          byte_code.push(data);
        }
      }
    } else {
      if(typeof(op) == 'undefined') {
        op = 0x0;
        var sop = d_sop_lookup[op_txt];  
        
        if(typeof(sop) == 'undefined') {
          errors.push({line:i,type:'ERROR',msg:'['+op_txt+'] Undefined op code.'});
          continue;
        }
        if(parms.length<1) {
          errors.push({line:i,type:'ERROR',msg:'['+op_txt+'] Requires at least one parameter.'});
          continue;
        }
        if(parms.length>1)
          errors.push({line:i,type:'WARNING',msg:'['+op_txt+'] Requires only one parameter. Extra parameter/s ignored.'});

          
        var a =  {value:sop};
        var b_txt = parms[0].trim();
        b = convert_value(b_txt,labels);
      } else {
        if(parms.length<2) {
          errors.push({line:i,type:'ERROR',msg:'['+op_txt+'] Requires at least two parameter.'});
          continue;
        }
        if(parms.length>2)
          errors.push({line:i,type:'WARNING',msg:'['+op_txt+'] Requires only two parameter. Extra parameter/s ignored.'});
      
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
        label_refs[a.label_ref].push({mem_pos:byte_code.length,source_line:i});
      }
      if(typeof(a.nw) != 'undefined') byte_code.push(parseInt(a.nw));
    
      if(typeof(b.label_ref) != 'undefined') {
        if(typeof(label_refs[b.label_ref]) == 'undefined')
          label_refs[b.label_ref] = [];
        label_refs[b.label_ref].push({mem_pos:byte_code.length,source_line:i});
      }
      if(typeof(b.nw) != 'undefined') byte_code.push(parseInt(b.nw));
    } 
  }  

  // Update all the label ref's
  //
  for(var i=0;i<label_keys.length;i++) {
    var label = label_keys[i];
    var offset = labels[label].offset;
    var refs = label_refs[label];         // {mem_pos:??,source_line:?? }
    if(typeof(refs) == 'undefined') continue;
    for(var j=0;j<refs.length;j++) {
      var ref = refs[j];
      byte_code[refs[j].mem_pos] = offset;
    }
    labels[label].refs = label_refs[label];
  }
  
  // Find all label refs to labels that do not exist
  //
  var label_ref_keys = Object.keys(label_refs);  // AL the labels that were referenced
  for(var i=0;i<label_ref_keys.length;i++) {
    var label = label_ref_keys[i];
    if(typeof(labels[label]) == 'undefined') {
      for(var j=0;j<label_refs[label].length;j++) {
        var source_line = label_refs[label][j].source_line;
        errors.push({line:source_line,type:'ERROR',msg:'['+label+'] Referenced but not defined.'});
      }
    }
  }
  
  //console.log(labels);
  //var str = [];
  //for(var i=0;i<byte_code.length;i++) str.push(byte_code[i].toString(16));
  //console.log(byte_code,str);
  return {byte_code:byte_code,labels:labels,errors:errors};
}

if(typeof(exports) != 'undefined') {
  exports.assemble = assemble;
} 

