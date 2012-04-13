var assert = require('assert');
var fs = require('fs');
var assembler = require('../lib/assembler');
var code_utils = require('../lib/code_utils');

check_byte_code = function(a,b) {
  if(a.length != b.length)
    return false;
  for(var i=0;i<a.length;i++) {
    if(a[i] != b[i]) 
      return false;
  }
  return true;
}

load_and_execute_testcase_file = function(filename) {
  var data = fs.readFileSync(filename,'utf-8'); 
  var lines = data.replace('\r','').replace('\t','').split('\n');
  for(var i=0;i<lines.length;i++){
    if(lines[i].trim() == '') break;
    var parts = lines[i].split(';');
    var code = parts[0].trim();
    var target_byte_code = parts[1].trim().split(' ');

    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code.toString(16));
  }
}

require('./assembler.test.gen.js');

module.exports = { 
  'test assembler labels ref' : function() { 
    var code = 'SET A,0x30     ; 0x7c01 0x0030 ';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    var target_byte_code = [0x7c01,0x0030];
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code);
  }, 
  'test assembler labels ref' : function() { 
    var code = 'SET [A],0x10   ; 0xc081';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    var target_byte_code = [0xc081];
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code);
  }, 
  'test assembler labels ref' : function() { 
    var code = 'IFB [A],0x10   ; 0xc08f';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    var target_byte_code = [0xc08f];
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code.toString(16));
  }, 
  
  'test assembler labels ref' : function() { 
    var code = 'xxx: SET PC,xxx ;This is my comment';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    var target_byte_code = [0x7dc1,0x0000];
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code.toString(16));
  },
  'test assembler jsr' : function() { 
    var code = 'JSR 0x40';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = byte_array_to_string(byte_code);
    var target_byte_code = [0x7c10,0x0040];
    var target_byte_code_string = byte_array_to_string(target_byte_code);
    
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code_string);
  },
  'test assembler jsr mem lookup' : function() { 
    var code = 'JSR [0x40]';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = byte_array_to_string(byte_code);
    var target_byte_code = [0x7810,0x0040];
    var target_byte_code_string = byte_array_to_string(target_byte_code);
    
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code_string);
  },
  'test assembler jsr mem lookup label' : function() { 
    var code = 'JSR [func]\nfunc: SET A,0x10';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = byte_array_to_string(byte_code);
    var target_byte_code = [0x7810,0x0002,0xc001];
    var target_byte_code_string = byte_array_to_string(target_byte_code);
    
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code_string);
  },

  
/*  'test assembler labels ref lookup' : function() { 
    var code = 'xxx: SET PC,[xxx]';
    var byte_code = assembler.assemble(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    var target_byte_code = [0x79c1,0x0000];
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code);
  }, 
  'test assembler debug' : function() {
    var code = 'SET  A, [0x10]\nSET PC , 0 ';
    var debug_info = assembler.assemble(code).debug_info;
    assert.equal(2,debug_info.length);
    assert.equal('SET A,[0x10]',debug_info[0].code);
    assert.equal('SET PC,0',debug_info[1].code);
  },
*/
}

