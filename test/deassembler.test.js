var assert = require('assert');
var fs = require('fs');
var assembler = require('../lib/assembler');
var deassembler = require('../lib/deassembler');

module.exports = { 
  'test deassembler set-hex' : function() { 
    var orig_code = 'SET PC,0x40\n';
    var byte_code = assembler.assemble(orig_code).byte_code;
    var code = deassembler.deassemble(byte_code).source;
    assert.equal(code,orig_code);
  },
  'test deassembler set-dec' : function() { 
    var orig_code = 'SET PC,40\n';
    var target_code = 'SET PC,0x28\n';
    var byte_code = assembler.assemble(orig_code).byte_code;
    var code = deassembler.deassemble(byte_code).source;
    assert.equal(code,target_code);
  }, 
  'test deassembler o,peek' : function() { 
    var orig_code = 'ADD O,PEEK\n';
    var byte_code = assembler.assemble(orig_code).byte_code;
    var code = deassembler.deassemble(byte_code).source;
    assert.equal(code,orig_code);
  }, 
  'test deassembler labels' : function() { 
    var orig_code = 'loop: ADD A,1\nSET PC,loop\n';
    var target_code = 'loop: ADD A,1\nSET PC,loop\n';
    var byte_code = assembler.assemble(orig_code).byte_code;
    var labels = {0x0:'loop'};
    var code = deassembler.deassemble(byte_code,labels).source;
    assert.equal(code,target_code);
  }, 
  'test deassembler labels2' : function() { 
    var orig_code = 'SET [data],0x40\ndata: SET [0x40],[0x40]\n';
    var target_code = 'SET [data],0x40\ndata: SET [0x40],[0x40]\n';
    var assembly = assembler.assemble(orig_code)
    var code = deassembler.deassemble(assembly.byte_code,assembly.labels).source;
    assert.equal(code,target_code);
  }, 
  'test deassembler labels' : function() { 
    var orig_code = 'SET PC,data\ndata: SET [0x33],[0x33]\n';
    var target_code = 'SET PC,data\ndata: SET [0x33],[0x33]\n';
    var assembly = assembler.assemble(orig_code);
    var byte_code = assembly.byte_code;
    var labels = assembly.labels;
    var code = deassembler.deassemble(byte_code,labels).source;
    assert.equal(code,target_code);
  }, 
  'test deassembler jsr' : function() { 
    var orig_code = 'JSR func\nSET B,0x20\nfunc: SET A,0x40\nSET PC,POP\n';
    var target_code = 'JSR func\nSET B,0x20\nfunc: SET A,0x40\nSET PC,POP\n';
    var assembly = assembler.assemble(orig_code);
    var byte_code = assembly.byte_code;
    var labels = assembly.labels;
    var code = deassembler.deassemble(byte_code,labels).source;
    assert.equal(code,target_code);
  }, 

  
}

