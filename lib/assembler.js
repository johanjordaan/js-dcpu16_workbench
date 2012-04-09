process_comment = function(stack,val) {
  var comment = val.trim();
  stack.push({type:'COMMENT',value:comment,debug:val});
}

process_label = function(stack,val) {
  var label = val.replace(':','').trim();
  stack.push({type:'LABEL',value:label,debug:val});
}

process_op = function(stack,val) {
  var op = val.trim();
  stack.push({type:'OP',value:op,debug:val});
}

process_register_offset = function(stack,val) {
  var offset=val.replace('[','').replace(']','').trim(); 
  offset = offset.split('+'); 
  stack.push({type:'PARM',sub_type:'REGISTER_OFFSET',value:offset,debug:val});
}

process_register_lookup = function(stack,val) {
  var address=val.replace('[','').replace(']','').trim(); 
  stack.push({type:'PARM',sub_type:'REGISTER_LOOKUP',value:address,debug:val});
}

process_register = function(stack,val) {
  var register=val.trim(); 
  stack.push({type:'PARM',sub_type:'REGISTER',value:register,debug:val});
}

process_number_lookup = function(stack,val) {
  var number=val.replace('[','').replace(']','').trim(); 
  stack.push({type:'PARM',sub_type:'NUMBER_LOOKUP',value:number,debug:val});
}

process_number = function(stack,val) {
  var number=val.trim(); 
  stack.push({type:'PARM',sub_type:'NUMBER',value:number,debug:val});
}

process_label_ref = function(stack,val) {
  var label_ref=val.trim(); 
  stack.push({type:'PARM',sub_type:'LABEL_REF',value:label_ref,debug:val});
}

process_label_ref_lookup = function(stack,val) {
  var label_ref=val.replace('[','').replace(']','').trim(); 
  stack.push({type:'PARM',sub_type:'LABEL_REF_LOOKUP',value:label_ref,debug:val});
}

process_stack_operations = function(stack,val) {
  var operation=val.trim(); 
  stack.push({type:'PARM',sub_type:'STACK',value:operation,debug:val});
}

process_overflow = function(stack,val) {
  stack.push({type:'PARM',sub_type:'OVERFLOW',debug:val});
}

process_newline = function(stack,val) {
  stack.push({type:'NEWLINE',debug:val});
}


tokenise = function(source) {
  var stack = [];
  var rules = [
      [ /;.*(\r|$|\n)/ , function(val) { process_comment(stack,val); }  ],
      [ /\S*:/ , function(val) { process_label(stack,val); }  ],
      [ /SET|ADD|SUB|MUL|DIV|MOD|SHL|SHR|AND|BOR|XOR|IFE|IFN|IFG|IFB/ , function(val) { process_op(stack,val); } ],
      [ /POP|PEEK|PUSH/ , function(val) { process_stack_operations(stack,val); } ],
      [ /\[[0x]+\d+\+([ABCXYZIJ]|PC|SP)\]/ , function(val) { process_register_offset(stack,val); } ],
      [ /\[([ABCXYZIJ])\]/ , function(val) { process_register_lookup(stack,val); } ],
      [ /\[[0x]+\d+\]/ , function(val) { process_number_lookup(stack,val); } ],
      [ /[ABCXYZIJ]|PC|SP/ , function(val) { process_register(stack,val); } ],
      [ /[0x]*\d+/ , function(val) { process_number(stack,val); } ],
      [ /O/ , function(val) { process_overflow(stack,val); } ],
      [ /\[\w+\]/ , function(val) { process_label_ref_lookup(stack,val); } ],
      [ /\w+/ , function(val) { process_label_ref(stack,val); } ],
      [ /\n/ , function(val) { process_newline(stack,val); } ],
      [ /[,\w\s]/ , function(val) {} ],
    ];
  var scanner = new Scanner(rules,function(err) { console.log('---',err); });
  scanner.process(source);
  return stack;
}

get_next_index = function(start,type,tokens) {
  for(var i=start;i<tokens.length;i++) {
    if(tokens[i].type == type) {
      return i;
    }
  }
  return -1;
}

generate = function(tokens) {
  var byte_code = [];
  var debug_info = [];
  var register_lookup = {A:0x0,B:0x1,C:0x2,X:0x3,Y:0x4,Z:0x5,I:0x6,J:0x7,SP:0x1b,PC:0x1c};
  var stack_lookup = {POP:0x18,PEEK:0x19,PUSH:0x1a};
  var cur_token_index = 0;
  var done = false;
  var labels = {};
  
  while(!done)
  {
    // Get the indexes of the next set of op and parms from the tokens list
    //
    var op_index = get_next_index(cur_token_index,'OP',tokens);
    var a_index = get_next_index(op_index+1,'PARM',tokens);
    var b_index = get_next_index(a_index+1,'PARM',tokens);
    cur_token_index = b_index+1;

    // Get the label for this line if required it is labeled
    //
    if(op_index>0 && tokens[op_index-1].type=='LABEL') {
      labels[tokens[op_index-1].value] = byte_code.length;
    }
        
    if(op_index == -1 || a_index==-1 || b_index==-1) {
      done = true;
      break;
    }
    
    // Get the actual values of the op and the parameters
    //
    var op = tokens[op_index];   
    var parms = [];
    parms.push(tokens[a_index]);
    parms.push(tokens[b_index]);

    
    // Now apply the packing rules based on the subtypes
    //
    var current_instruction = [];
    current_instruction[0] = operations[op.value].value;
    var shift = [4,10];
    for(var i=0;i<parms.length;i++)
    {
      var p = parms[i];
      switch(p.sub_type) {
        case 'REGISTER':
          var val = (register_lookup[p.value])<<shift[i];
          current_instruction[0] = current_instruction[0] | val;
          break;
        case 'REGISTER_LOOKUP':
          var val = (register_lookup[p.value] + 0x8)<<shift[i];
          current_instruction[0] = current_instruction[0] | val;
          break;
        case 'REGISTER_OFFSET':
          var val = (register_lookup[p.value[1]] + 0x10)<<shift[i];
          current_instruction[0] = current_instruction[0] | val;
          current_instruction.push(parseInt(p.value[0], 16));
          break;
        case 'NUMBER':
          if(p.value<=0x1f) {
            var val = (parseInt(p.value, 16)+0x20)<<shift[i];
            current_instruction[0] |= val;
          } else {
            current_instruction[0] |= 0x1f<<shift[i];
            current_instruction.push(parseInt(p.value, 16));
          }
          break;
        case 'NUMBER_LOOKUP':
          current_instruction[0] |= 0x1e<<shift[i];
          current_instruction.push(parseInt(p.value, 16));
          break;
        case 'STACK':
          var val = stack_lookup[p.value];
          current_instruction[0] |= val<<shift[i];
          break;
        case 'OVERFLOW':
          current_instruction[0] |= 0x1d<<shift[i];
          break;
        case 'LABEL_REF':
          var address = labels[p.value];
          current_instruction[0] |= 0x1f<<shift[i];
          current_instruction.push(parseInt(address, 16));
          break;
        case 'LABEL_REF_LOOKUP':
          var address = labels[p.value];
          current_instruction[0] |= 0x1e<<shift[i];
          current_instruction.push(parseInt(address, 16));
          break;
      }
    }

    var current_debug_info = {byte_code:[]}
    current_debug_info.mem_pos = byte_code.length;
    for(var i=0;i<current_instruction.length;i++) {
      byte_code.push(current_instruction[i]);
      current_debug_info.byte_code.push(current_instruction[i]);
    }
    current_debug_info.code = op.debug + ' ' + tokens[a_index].debug + ',' + tokens[b_index].debug;
    
    debug_info.push(current_debug_info);
  }
  return {byte_code:byte_code,debug_info:debug_info};
}

compile = function(source) {
  var tokens = tokenise(source);
  var ret_val = generate(tokens);  
  return ret_val;
}

if(typeof(exports) != 'undefined') {
  exports.generate = compile;
} 

