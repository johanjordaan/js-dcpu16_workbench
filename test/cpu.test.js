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
}

