var assert = require('assert');
var fs = require('fs');
var assembler = require('../lib/assembler');
var code_utils = require('../lib/code_utils');

module.exports = { 
  'test assembler invalid command ' : function() { 
    var code = 'SEET A,10'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('ERROR',assembly.errors[0].type);
    assert.equal(0,assembly.errors[0].line);
  },
  'test assembler valid command to few parameters ' : function() { 
    var code = 'DAT'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('ERROR',assembly.errors[0].type);
    assert.equal(0,assembly.errors[0].line);
    
    var code = 'SET A'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('ERROR',assembly.errors[0].type);
    assert.equal(0,assembly.errors[0].line);
    
    var code = 'JSR'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('ERROR',assembly.errors[0].type);
    assert.equal(0,assembly.errors[0].line);

  },
  'test assembler valid command to many parameters ' : function() { 
    var code = ';Some comment\nDAT 0x50,0x50'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('WARNING',assembly.errors[0].type);
    assert.equal(1,assembly.errors[0].line);
    
    var code = 'SET A, 0x10,44'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('WARNING',assembly.errors[0].type);
    assert.equal(0,assembly.errors[0].line);
    
    var code = 'JSR A,B'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('WARNING',assembly.errors[0].type);
    assert.equal(0,assembly.errors[0].line);
  },
  'test assembler undefined label' : function() { 
    var code = 'SET [XXX],0x00'
    var assembly = assembler.assemble(code);
    assert.equal(1,assembly.errors.length);
    assert.equal('ERROR',assembly.errors[0].type);
    assert.equal(0,assembly.errors[0].line);
    
    var code = ';Comment\nSET [XXX],0x10\nSET [XXX],0x20'
    var assembly = assembler.assemble(code);
    assert.equal(2,assembly.errors.length);
    assert.equal('ERROR',assembly.errors[0].type);
    assert.equal('ERROR',assembly.errors[1].type);
    assert.equal(1,assembly.errors[0].line);
    assert.equal(2,assembly.errors[1].line);
  }

  
}

