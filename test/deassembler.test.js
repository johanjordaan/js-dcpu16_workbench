var assert = require('assert');
var fs = require('fs');
var scanner = require('../lib/scanner');
var assembler = require('../lib/assembler');
var deassembler = require('../lib/deassembler');

module.exports = { 
  'test deassembler' : function() { 
    var orig_code = 'SET PC,0x40\n';
    var byte_code = assembler.generate(orig_code).byte_code;
    var code = deassembler.deassemble(byte_code);
    assert.equal(code,orig_code);
  },
  'test deassembler' : function() { 
    var orig_code = 'SET PC,40\n';
    var target_code = 'SET PC,0x28\n';
    var byte_code = assembler.generate(orig_code).byte_code;
    var code = deassembler.deassemble(byte_code);
    assert.equal(code,target_code);
  }, 
  'test deassembler' : function() { 
    var orig_code = 'ADD O,PEEK\n';
    var byte_code = assembler.generate(orig_code).byte_code;
    var code = deassembler.deassemble(byte_code);
    assert.equal(code,orig_code);
  }, 
}

