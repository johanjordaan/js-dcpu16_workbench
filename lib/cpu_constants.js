operations = {
  SET:{name:'SET',value:0x1},
  ADD:{name:'ADD',value:0x2},
  SUB:{name:'SUB',value:0x3},
  MUL:{name:'MUL',value:0x4},
  DIV:{name:'DIV',value:0x5},
  MOD:{name:'MOD',value:0x6},
  SHL:{name:'SHL',value:0x7},
  SHR:{name:'SHR',value:0x8},
  AND:{name:'AND',value:0x9},
  BOR:{name:'BOR',value:0xa},
  XOR:{name:'XOR',value:0xb},
  IFE:{name:'IFE',value:0xc},
  IFN:{name:'IFN',value:0xd},
  IFG:{name:'IFG',value:0xe},
  IFB:{name:'IFB',value:0xf},
};
registers = {
  A:{name:'A',value:0x0},
  B:{name:'B',value:0x1},
  C:{name:'C',value:0x2},
  X:{name:'X',value:0x3},
  Y:{name:'Y',value:0x4},
  Z:{name:'Z',value:0x5},
  I:{name:'I',value:0x6},
  J:{name:'J',value:0x7},
};
special_registers = {
  SP:{name:'SP',value:0x1b},
  PC:{name:'PC',value:0x1c},
  O:{name:'O',value:0x1d},
};
stack_operations = {
  SP:{name:'POP',value:0x18},
  PC:{name:'PEEK',value:0x19},
  O:{name:'PUSH',value:0x1a},
};

if(typeof(exports) != 'undefined') {
  exports.operations = operations;
  exports.registers = registers;
}