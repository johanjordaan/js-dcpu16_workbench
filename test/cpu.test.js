var assert = require('assert');
var fs = require('fs');
var assembler = require('../lib/assembler');
var code_utils = require('../lib/code_utils');
var CPU = new require('../lib/cpu')
var Debugger = new require('../lib/debugger');

module.exports = { 
  'test cpu set' : function() { 
    var code = 'SET A,0x30';
    var cpu = new CPU.CPU();
    var dbg = new Debugger.Debugger(cpu);
    dbg.load(0,code);
    dbg.step();
    assert.equal(0x30,dbg.cpu.registers.A);
  }, 
  'test cpu set [nw+R]' : function() { 
    var code = 'SET B,0x1\nSET [0x41],0xFA\nSET A,[0x40+B]\nSET [0x40+C],0xFC';
    var cpu = new CPU.CPU();
    var dbg = new Debugger.Debugger(cpu);
    dbg.load(0,code);
    dbg.step();
    assert.equal(0x1,dbg.cpu.registers.B);
    dbg.step();
    assert.equal(0xFA,dbg.cpu.memory[0x41]);
    dbg.step();
    assert.equal(0xFA,dbg.cpu.registers.A);
    dbg.step();
    assert.equal(0xFC,dbg.cpu.memory[0x40]);
  },
  'test memory delta' : function() { 
    var code = 'SET [0x10],0x40\nSET [0x20],0x04\nSET [0x50],0x55]\nSET [0x44],0x44';
    var cpu = new CPU.CPU();
    var dbg = new Debugger.Debugger(cpu);
    dbg.load(0,code);
    dbg.step();
    assert.equal(1,dbg.cpu.memory_changes.length);
    assert.equal(0x10,dbg.cpu.memory_changes[0]);
    dbg.step();
    assert.equal(2,dbg.cpu.memory_changes.length);
    assert.equal(0x20,dbg.cpu.memory_changes[0]);
    assert.equal(0x10,dbg.cpu.memory_changes[1]);
    dbg.step();
    assert.equal(3,dbg.cpu.memory_changes.length);
    assert.equal(0x50,dbg.cpu.memory_changes[0]);
    dbg.step();
    assert.equal(3,dbg.cpu.memory_changes.length);
    assert.equal(0x44,dbg.cpu.memory_changes[0]);
    assert.equal(0x50,dbg.cpu.memory_changes[1]);
    assert.equal(0x20,dbg.cpu.memory_changes[2]);
    dbg.reset();    
    assert.equal(0,dbg.cpu.memory_changes.length);
  }, 

}

