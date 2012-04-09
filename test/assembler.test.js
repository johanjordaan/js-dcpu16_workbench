var assert = require('assert');
var fs = require('fs');
var scanner = require('../lib/scanner');
var assembler = require('../lib/assembler');

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

    var byte_code = assembler.generate(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code);
  }
}

require('./assembler.test.gen.js');

module.exports = { 
  'test assembler labels ref' : function() { 
    var code = 'xxx: SET PC,xxx';
    var byte_code = assembler.generate(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    var target_byte_code = [0x7dc1,0x0000];
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code);
  }, 
  'test assembler labels ref lookup' : function() { 
    var code = 'xxx: SET PC,[xxx]';
    var byte_code = assembler.generate(code).byte_code;
    var byte_code_string = [];
    for(var j=0;j<byte_code.length;j++) 
      byte_code_string.push(byte_code[j].toString(16));
    var target_byte_code = [0x79c1,0x0000];
    assert.ok(check_byte_code(target_byte_code,byte_code),'\n'+code+'\nIs : '+byte_code_string+' Should Be : '+target_byte_code);
  }, 
  'test assembler debug' : function() {
    var code = 'SET  A, [0x10]\nSET PC , 0 ';
    var debug_info = assembler.generate(code).debug_info;
    assert.equal(2,debug_info.length);
    assert.equal('SET A,[0x10]',debug_info[0].code);
    assert.equal('SET PC,0',debug_info[1].code);
  },

}

