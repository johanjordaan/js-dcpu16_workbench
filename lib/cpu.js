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
  SPECIAL_OP : 12,
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
    this.value = parseInt(value);
    this.done = true;

    this.accept_next_word_ref_offset = false;
    
  } else if(value >= 0x00 && value <= 0x07) {
    this.type = ValueTypeEnum.REGISTER_LOOKUP;
    this.ref = register_lookup[value]; 
    this.done = true;
    
  } else if(value >= 0x08 && value <= 0x0F) {
    this.type = ValueTypeEnum.REGISTER_LOOKUP_MEM;
    this.ref = register_lookup[value-8];
    this.done = true;    
  
  } else if(value >= 0x10 && value <= 0x17) {
	this.ref = register_lookup[value - 0x10];
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
    return this.cpu.get_register(this.ref);
  }
  if(this.type==ValueTypeEnum.REGISTER_LOOKUP_MEM) {
    return this.cpu.get_memory(this.cpu.get_register(this.ref));
  }
  if(this.type==ValueTypeEnum.REGISTER_OFFSET_MEM) {
    return this.cpu.get_memory(this.value + this.cpu.get_register(this.ref));
  }
  if(this.type==ValueTypeEnum.LITERAL) {
    return this.value;
  }
  if(this.type==ValueTypeEnum.MEMORY_LOOKUP) {
    return this.cpu.get_memory(this.ref);
  }
  if(this.type==ValueTypeEnum.SP) {
    return this.cpu.get_register('SP');
  }
  if(this.type==ValueTypeEnum.PC) {
    return this.cpu.get_register('PC');
  }
  if(this.type==ValueTypeEnum.OVERFLOW) {
    return this.cpu.get_register('O')
  }
  if(this.type==ValueTypeEnum.PEEK) {
    return this.cpu.get_memory(this.cpu.get_register('SP'));
  }
  if(this.type==ValueTypeEnum.POP) {
    var ret_val = this.cpu.get_memory(this.cpu.get_register('SP'));
    this.cpu.set_register('SP',this.cpu.get_register('SP')+1);
    return ret_val;
  }
  if(this.type==ValueTypeEnum.SPECIAL_OP) {
    return this.value;
  }
}

Value.prototype.set = function(val) {
  switch(this.type) {
    case ValueTypeEnum.REGISTER_LOOKUP:
      this.cpu.set_register(this.ref,val);
      break;
    case ValueTypeEnum.REGISTER_LOOKUP_MEM:
      this.cpu.set_memory(this.cpu.get_register(this.ref),val);
      break;
    case ValueTypeEnum.REGISTER_OFFSET_MEM:
      this.cpu.set_memory(this.value + this.cpu.get_register(this.ref),val);
      break;
    case ValueTypeEnum.MEMORY_LOOKUP:
      this.cpu.set_memory(this.ref,val);
      break;
    case ValueTypeEnum.SP:
      this.cpu.set_register('SP',val);
      break;
    case ValueTypeEnum.PC:
      this.cpu.set_register('PC',val);
      break;
    case ValueTypeEnum.OVERFLOW:
      this.cpu.set_register('O',val);
      break;
    case ValueTypeEnum.PUSH:
      this.cpu.set_register('SP',this.cpu.get_register('SP')-1);
      this.cpu.set_memory(this.cpu.get_register('SP'),val);
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
  
  this.memory_changes = []
  this.memory_change_depth = 3;
  
  this.clear_memory();
  
  this.cycle = 0;
  
  this.current_opcode = null;
  this.a = null;
  this.b = null;
  this.skip_next = false;
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
  var mul = this.a.get()*this.b.get();
  this.a.set(mul);
  this.overflow = ((a.get()>>16)&0xffff);
}

CPU.prototype.div = function() {
  if(this.b.get()==0) {
    this.a.set(0);
    this.overflow = 0;
  } else {
    var div = this.a.get()/this.b.get();
    this.a.set(div);
    this.overflow = ((this.a.get()<<16)/this.b.get());
  }
}

CPU.prototype.mod = function() {
  if(this.b.get()==0){
    this.a.set(this.overflow);
  }else {
    this.a.set(this.a.get()%this.b.get());
  }
}

CPU.prototype.shl = function() {
  var tmp = this.a.get()<<this.b.get();
  this.a.set(tmp);
  this.overflow = ((tmp)>>16)&0xffff
}

CPU.prototype.shr = function() {
  this.a.set(this.a.get()<<this.b.get());
  this.overflow = ((this.a.get()<<16)>>this.b.get())&0xffff
}

CPU.prototype.and = function() {
  this.a.set(this.a.get()&this.b.get());
}

CPU.prototype.bor = function() {
  this.a.set(this.a.get()|this.b.get());
}

CPU.prototype.xor = function() {
  this.a.set(this.a.get()^this.b.get());
}

CPU.prototype.ife = function() {
  return this.a.get() == this.b.get();
}

CPU.prototype.ifn = function() {
  return this.a.get() != this.b.get();
}

CPU.prototype.ifg = function() {
  return this.a.get() > this.b.get();
}

CPU.prototype.ifb = function() {
  return ((this.a.get() & this.b.get())!=0);
}

CPU.prototype.jsr = function() {
  this.set_register('SP',this.get_register('SP')-1)
  this.set_memory(this.get_register('SP'),this.pc);
  this.set_register('PC',this.b.get())
}

CPU.prototype.set_memory = function(pos,val) {
  this.memory[pos] = val;
  if(this.memory_changes.unshift(pos)>this.memory_change_depth)
    this.memory_changes.pop();
}
CPU.prototype.get_memory = function(pos) {
  return this.memory[pos];
}
CPU.prototype.set_register = function(register,val) {
  if(register=='SP') {
    this.sp = val;
  } else if(register=='PC') {
    this.pc = val;
  } else if(register=='O') {
    this.overflow = val;
  } else {
    this.registers[register] = val;
  }
}
CPU.prototype.get_register = function(register) {
  if(register=='SP') {
    return this.sp;
  } else if(register=='PC') {
    return this.pc;
  } else if(register=='O') {
    this.overflow = val;
  } else {
    return this.registers[register];
  }
}


CPU.prototype.step = function() {
  var current_word = this.memory[this.pc];
  
  if(this.current_opcode == null) {
    this.current_opcode = current_word & 0x000F;
    if(this.current_opcode==0x0) {          // Handle specail op codes
      this.a = new Value(this);
      this.a.value = (current_word>>4) & 0x003F;
      this.a.type = ValueTypeEnum.SPECIAL_OP;
      this.a.done = true;
    } else {
      this.a = new Value(this);
      this.a.construct((current_word>>4) & 0x003F);
    }
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
    if(this.skip_next){
      this.skip_next = false;
    } else {
      switch(this.current_opcode) {
        case 0x0: 
          switch(this.a.get()){
            case 0x1: this.jsr(); break;
          }
          break;
        case 0x1: this.set(); break;
        case 0x2: this.add(); break;
        case 0x3: this.sub(); break;
        case 0x4: this.mul(); break;
        case 0x5: this.div(); break;
        case 0x6: this.mod(); break;
        case 0x7: this.shl(); break;
        case 0x8: this.shr(); break;
        case 0x9: this.and(); break;
        case 0xa: this.bor(); break;
        case 0xb: this.xor(); break;
        case 0xc: this.skip_next=this.ife(); break;
        case 0xd: this.skip_next=this.ifn(); break;
        case 0xe: this.skip_next=this.ifg(); break; 
        case 0xf: this.skip_next=this.ifb(); break;
      }
    };
       
    this.current_opcode = null;
    this.a = null;
    this.b = null;
  } 

  this.cycle++;
}

if(typeof(exports) != 'undefined') {
  exports.CPU = CPU;
} 

