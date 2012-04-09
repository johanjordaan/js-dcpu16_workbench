var ValueTypeEnum = {
  REGISTER_LOOKUP : 0,
  REGISTER_LOOKUP_MEM : 1,
  LITERAL : 3,
  MEMORY_LOOKUP : 4,
  POP : 5,
  PEEK : 6,
  PUSH : 7,
  SP : 8,
  PC : 9,
  OVERFLOW : 10,
  REGISTER_OFFSET_MEM : 11,
}

var Value = function(cpu) {
  this.cpu = cpu;
  this.done = false;
  this.accept_next_word = false;
  this.accept_next_word_ref = false;
  this.value = null;
  this.type = null;
}

Value.prototype.construct = function(value) {
  var register_lookup = ['A','B','C','X','Y','Z','I','J'];

  if(this.accept_next_word) {
    this.type = ValueTypeEnum.LITERAL;
    this.value = value; 
    this.done = true;

    this.accept_next_word = false;
    
  } else if(this.accept_next_word_ref) {
    this.type = ValueTypeEnum.MEMORY_LOOKUP;
    this.ref = value;
    this.done = true;

    this.accept_next_word_ref = false;

  } else if(this.accept_next_word_ref_offset) {
    this.type = ValueTypeEnum.REGISTER_OFFSET_MEM;
    this.ref = value[0];
    this.done = true;

    this.accept_next_word_ref = false;
    
  } else if(value >= 0x00 && value <= 0x07) {
    this.type = ValueTypeEnum.REGISTER_LOOKUP;
    this.ref = register_lookup[value]; 
    this.done = true;
    
  } else if(value >= 0x08 && value <= 0x0F) {
    this.type = ValueTypeEnum.REGISTER_LOOKUP_MEM;
    this.ref = register_lookup[value-8];
    this.done = true;    
  
  } else if(value >= 0x10 && value <= 0x17) {
    this.ref = register_lookup[value[1] - 0x10];
    this.accept_next_word_ref_offset = true;
    this.done = false;

  } else if(value == 0x18) {
    this.type = ValueTypeEnum.POP;
    this.done = true;
    
  } else if(value == 0x19) {
    this.type = ValueTypeEnum.PEEK;
    this.done = true;
  
  } else if(value == 0x1a) {
    this.type = ValueTypeEnum.PUSH;
    this.done = true;
    
  } else if(value == 0x1b) {
    this.type = ValueTypeEnum.SP;
    this.done = true;
  
  } else if(value == 0x1c) {
    this.type = ValueTypeEnum.PC;
    this.done = true;
    
  } else if(value == 0x1d) {
    this.type = ValueTypeEnum.OVERFLOW;
    this.done = true;
    
  } else if(value == 0x1e) {
    this.accept_next_word_ref = true;
    this.done = false;
    
  } else if(value == 0x1f) {
    this.accept_next_word = true;
    this.done = false;
    
  } else if(value >= 0x20 && value <= 0x3f) {
    this.type = ValueTypeEnum.LITERAL;
    this.value = value - 0x20;
    this.done = true;
  }
}

Value.prototype.get = function() {
  if(this.type==ValueTypeEnum.REGISTER_LOOKUP) {
    return this.cpu.registers[this.ref];
  }
  if(this.type==ValueTypeEnum.REGISTER_LOOKUP_MEM) {
    return this.cpu.memory[this.cpu.registers[this.ref]];
  }
  if(this.type==ValueTypeEnum.REGISTER_OFFSET_MEM) {
    return this.cpu.memory[this.val + this.cpu.registers[this.ref]];
  }
  if(this.type==ValueTypeEnum.LITERAL) {
    return this.value;
  }
  if(this.type==ValueTypeEnum.MEMORY_LOOKUP) {
    return this.cpu.memory[this.ref];
  }
  if(this.type==ValueTypeEnum.SP) {
    return this.cpu.sp;
  }
  if(this.type==ValueTypeEnum.PC) {
    return this.cpu.pc;
  }
  if(this.type==ValueTypeEnum.OVERFLOW) {
    return this.cpu.overflow;
  }
}

Value.prototype.set = function(val) {
  switch(this.type) {
    case ValueTypeEnum.REGISTER_LOOKUP:
      this.cpu.registers[this.ref] = val;
      break;
    case ValueTypeEnum.REGISTER_LOOKUP_MEM:
      this.cpu.memory[this.cpu.registers[this.ref]] = val;
      break;
    case ValueTypeEnum.REGISTER_OFFSET_MEM:
      this.cpu.memory[this.val + this.cpu.registers[this.ref]] = val;
      break;
    case ValueTypeEnum.MEMORY_LOOKUP:
      this.cpu.memory[this.ref] = val;
      break;
    case ValueTypeEnum.SP:
      this.cpu.sp = val;
      break;
    case ValueTypeEnum.PC:
      this.cpu.pc = val;
      break;
    case ValueTypeEnum.OVERFLOW:
      this.cpu.pc = val;
      break;
  }
}

var CPU = function() {
  this.reset();
}

CPU.prototype.reset = function() {
  this.registers = {'A':0,'B':0,'C':0,'X':0,'Y':0,'Z':0,'I':0,'J':0 };
  this.pc=0;
  this.sp=0x40;
  this.overflow=0;
  this.memory = [];


  this.registers_ordered = ['A','B','C','X','Y','Z','I','J'];
  
  this.clear_memory();
  
  this.cycle = 0;
  
  this.current_opcode = null;
  this.a = null;
  this.b = null;
}

CPU.prototype.clear_memory = function() {
  for(var i=0;i<0x10000;i++)
    this.memory[i] = 0;
}

CPU.prototype.load = function(address,data) {
  for(var i=0;i<data.length;i++)
    this.memory[address+i] = data[i];
}

CPU.prototype.push = function(value) {
  this.memory[this.sp] = value;
  this.sp++;
}

CPU.prototype.set = function() {
  this.a.set(this.b.get());
}

CPU.prototype.add = function() {
  var sum = this.a.get()+this.b.get();
  this.a.set(sum&0xFFFFFFFF);
  if(sum>0xFFFFFF) {
    this.overflow = 0x0001;
  } else {
    this.overflow = 0;
  }
}

CPU.prototype.sub = function() {
  var subb = this.a.get()-this.b.get();
  this.a.set(subb&0xFFFFFFFF);
  if(subb<0) {
    this.overflow = 0xFFFF;
  } else {
    this.overflow = 0;
  }
}

CPU.prototype.mul = function() {
  var mull = this.a.get()*this.b.get();
  this.a.set(mull);
  this.overflow = ((mull>>16)&0xffff);
}




CPU.prototype.ife = function(a,b) {
  return this.a.get() != this.b.get();
}

var skip_next = false;
CPU.prototype.step = function() {
  var current_word = this.memory[this.pc];
  
  if(this.current_opcode == null) {
    this.current_opcode = current_word & 0x000F;
    this.a = new Value(this);
    this.a.construct((current_word>>4) & 0x003F);
    this.b = new Value(this);
    this.b.construct((current_word>>10) & 0x003F);
  } else {
    if(!this.a.done) {
      this.a.construct(current_word);
    } else if(!this.b.done) {
      this.b.construct(current_word);
    }
  }

  this.pc++;  
  
  if(this.a.done && this.b.done) {
    if(skip_next){
      skip_next = false;
    } else {
      switch(this.current_opcode) {
        case 0x1:   // set
          this.set();
          break;
        case 0x2:   // add
          this.add();
          break;
        case 0x3:   // sub
          this.sub();
          break;  
        case 0x4:   // mul
          this.mul();
          break;  
        case 0xc:   // ife
          skip_next = this.ife();
          break;
      }
    } 
       
    this.current_opcode = null;
    this.a = null;
    this.b = null;
    
  } 

  this.cycle++;
}


var cpu = new CPU(); 